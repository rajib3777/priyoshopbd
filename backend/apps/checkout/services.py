"""
Checkout Service — 20-step atomic transactional order placement.
This is the heart of the order system.

CRITICAL:
- All prices calculated server-side
- select_for_update prevents overselling
- Full rollback on any failure
- Price snapshots at order time
- Never use current product price for historical orders
"""
import hashlib
import logging
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from apps.orders.models import Order, OrderItem, OrderStatusHistory, OrderRiskScore
from apps.cart.models import Cart, AbandonedCart
from apps.inventory.models import Inventory, InventoryTransaction
from apps.coupons.models import Coupon, CouponUsage
from apps.discounts.models import AccountDiscountConfig
from apps.shipping.models import ShippingRate
from apps.notifications.services import notify_order_placed
from apps.audit.models import AuditLog
from core.utils import generate_order_number, round_currency, get_client_ip

logger = logging.getLogger('apps.checkout')


class CheckoutService:
    """
    Handles the complete order placement flow atomically.
    Follows the 20-step checkout transaction specification.
    """

    def __init__(self, request, checkout_data: dict):
        self.request = request
        self.data = checkout_data
        self.user = request.user if request.user.is_authenticated else None
        self.errors = []

    def place_order(self) -> Order:
        """
        Execute all 20 steps in a single atomic transaction.
        Raises ValueError with error details on failure.
        """
        try:
            with transaction.atomic():
                return self._execute_order_flow()
        except ValueError:
            raise
        except Exception as e:
            logger.error(f'Order placement failed: {e}', exc_info=True)
            raise ValueError(f'Order could not be placed: {str(e)}')

    def _execute_order_flow(self):
        # ─── Step 1: Authenticate / Identify Customer ─────────────────────
        customer = self.user
        guest_email = self.data.get('email', '') if not customer else ''

        # ─── Step 2: Load Cart ────────────────────────────────────────────
        cart = self._get_cart()
        if not cart or not cart.items.exists():
            raise ValueError('Cart is empty')

        # ─── Step 3: Lock Inventory Rows ──────────────────────────────────
        product_ids = list(cart.items.values_list('product_id', flat=True))
        variant_ids = list(cart.items.exclude(variant=None).values_list('variant_id', flat=True))

        locked_inventories = Inventory.objects.select_for_update().filter(
            product_id__in=product_ids
        )
        if variant_ids:
            Inventory.objects.select_for_update().filter(variant_id__in=variant_ids)

        # ─── Step 4: Validate Product Status ─────────────────────────────
        cart_items = list(cart.items.select_related(
            'product', 'product__inventory', 'variant', 'variant__inventory'
        ).all())

        for item in cart_items:
            if not item.product.is_active or item.product.status != 'active':
                raise ValueError(f'"{item.product.name}" is no longer available')

        # ─── Step 5: Validate Stock ───────────────────────────────────────
        for item in cart_items:
            inv = self._get_inventory(item)
            if inv and item.product.track_inventory:
                if inv.available_quantity < item.quantity:
                    raise ValueError(
                        f'Only {inv.available_quantity} units of "{item.product.name}" available'
                    )

        # ─── Step 6: Recalculate Product Prices ──────────────────────────
        subtotal = Decimal('0.00')
        order_items_data = []

        for item in cart_items:
            if item.variant:
                buying_price = item.variant.get_buying_price()
                published_price = item.variant.published_price or item.product.published_price
                discount_price = item.variant.discount_price or item.product.discount_price
                admin_price = item.product.admin_price
            else:
                buying_price = item.product.buying_price
                published_price = item.product.published_price
                discount_price = item.product.discount_price
                admin_price = item.product.admin_price

            unit_price = discount_price if (discount_price and discount_price < published_price) else published_price
            line_total = round_currency(unit_price * item.quantity)
            line_buying_cost = round_currency(buying_price * item.quantity)
            line_profit = line_total - line_buying_cost

            subtotal += line_total
            order_items_data.append({
                'item': item,
                'buying_price_snapshot': buying_price,
                'admin_price_snapshot': admin_price,
                'published_price_snapshot': published_price,
                'discount_price_snapshot': discount_price,
                'unit_price': unit_price,
                'line_total': line_total,
                'line_buying_cost': line_buying_cost,
                'line_profit': line_profit,
            })

        subtotal = round_currency(subtotal)

        # ─── Step 7: Calculate Account Discount ──────────────────────────
        account_discount = Decimal('0.00')
        if customer:
            config = AccountDiscountConfig.get_active()
            if config and config.is_enabled:
                try:
                    profile = customer.customer_profile
                    order_count = profile.total_orders
                except Exception:
                    order_count = 0
                account_discount = config.calculate(subtotal, order_count)

        # ─── Step 8: Validate Coupon ──────────────────────────────────────
        coupon_obj = None
        coupon_discount = Decimal('0.00')
        coupon_code = self.data.get('coupon_code', '').strip().upper()

        if coupon_code:
            coupon_obj, coupon_discount = self._validate_coupon(
                coupon_code, customer, subtotal - account_discount
            )

        # ─── Step 9: Calculate Shipping ───────────────────────────────────
        shipping_charge = self._calculate_shipping(subtotal - account_discount - coupon_discount)

        # ─── Step 10: Calculate Final Total ──────────────────────────────
        discount_total = account_discount + coupon_discount
        grand_total = round_currency(subtotal - discount_total + shipping_charge)

        if grand_total < Decimal('0.00'):
            grand_total = Decimal('0.00')

        # ─── Step 11: Snapshot Financial Data ─────────────────────────────
        # (done per-item above, order-level captured in step 12)

        # ─── Step 12: Create Order ────────────────────────────────────────
        idempotency_key = self.data.get('idempotency_key')
        if idempotency_key:
            existing = Order.objects.filter(idempotency_key=idempotency_key).first()
            if existing:
                return existing

        # Build buying cost total
        total_buying_cost = sum(d['line_buying_cost'] for d in order_items_data)
        estimated_profit = grand_total - total_buying_cost - shipping_charge

        order = Order.objects.create(
            order_number=generate_order_number(),
            customer=customer,
            guest_email=guest_email,
            status='pending',
            payment_method=self.data.get('payment_method', 'cod'),
            # Customer info snapshot
            customer_name=self.data.get('full_name', ''),
            customer_phone=self.data.get('phone', ''),
            customer_email=self.data.get('email', ''),
            # Shipping snapshot
            shipping_name=self.data.get('shipping_name', self.data.get('full_name', '')),
            shipping_phone=self.data.get('shipping_phone', self.data.get('phone', '')),
            shipping_address=self.data.get('address', ''),
            shipping_city=self.data.get('city', ''),
            shipping_area=self.data.get('area', ''),
            shipping_postal_code=self.data.get('postal_code', ''),
            shipping_note=self.data.get('shipping_note', ''),
            # Financials
            subtotal=subtotal,
            discount_amount=discount_total,
            coupon_discount=coupon_discount,
            account_discount=account_discount,
            shipping_charge=shipping_charge,
            grand_total=grand_total,
            total_buying_cost=round_currency(total_buying_cost),
            estimated_profit=round_currency(estimated_profit),
            coupon=coupon_obj,
            coupon_code_used=coupon_code,
            idempotency_key=idempotency_key,
            ip_address=get_client_ip(self.request),
        )

        # ─── Step 13: Create Order Items ──────────────────────────────────
        for d in order_items_data:
            item = d['item']
            OrderItem.objects.create(
                order=order,
                product=item.product,
                variant=item.variant,
                product_name=item.product.name,
                product_sku=item.variant.sku if item.variant else item.product.sku,
                variant_name=item.variant.name if item.variant else '',
                quantity=item.quantity,
                buying_price_snapshot=d['buying_price_snapshot'],
                admin_price_snapshot=d['admin_price_snapshot'],
                published_price_snapshot=d['published_price_snapshot'],
                discount_price_snapshot=d['discount_price_snapshot'],
                unit_price=d['unit_price'],
                line_total=d['line_total'],
                line_buying_cost=d['line_buying_cost'],
                line_profit=d['line_profit'],
            )

        # ─── Step 14: Deduct Stock ────────────────────────────────────────
        for d in order_items_data:
            item = d['item']
            inv = self._get_inventory(item)
            if inv and item.product.track_inventory:
                prev_qty = inv.quantity
                inv.quantity -= item.quantity
                inv.save(update_fields=['quantity', 'updated_at'])

                # ─── Step 15: Record Inventory Transactions ───────────────
                InventoryTransaction.objects.create(
                    inventory=inv,
                    transaction_type='sale',
                    quantity=-item.quantity,
                    previous_quantity=prev_qty,
                    new_quantity=inv.quantity,
                    reference=order.order_number,
                    notes=f'Order {order.order_number} placed',
                )

                # Update product analytics
                item.product.order_count += 1
                item.product.units_sold += item.quantity
                item.product.revenue_total += d['line_total']
                item.product.profit_total += d['line_profit']
                item.product.save(update_fields=[
                    'order_count', 'units_sold', 'revenue_total', 'profit_total', 'updated_at'
                ])

        # ─── Step 16: Record Coupon Usage ─────────────────────────────────
        if coupon_obj and customer:
            CouponUsage.objects.create(
                coupon=coupon_obj,
                customer=customer,
                order=order,
                discount_applied=coupon_discount,
            )
            coupon_obj.usage_count += 1
            coupon_obj.save(update_fields=['usage_count'])

        # ─── Step 17: Clear Cart ──────────────────────────────────────────
        cart.items.all().delete()
        if coupon_obj:
            cart.coupon = None
            cart.save(update_fields=['coupon'])

        # ─── Step 18: Create Order Status History ─────────────────────────
        OrderStatusHistory.objects.create(
            order=order,
            previous_status='',
            new_status='pending',
            changed_by=customer,
            note='Order placed by customer',
        )

        # ─── Step 19: Calculate Risk Score ───────────────────────────────
        self._calculate_risk_score(order)

        # ─── Step 20: Trigger Notification ───────────────────────────────
        try:
            notify_order_placed(order)
        except Exception as e:
            logger.warning(f'Notification failed for order {order.order_number}: {e}')

        # Update customer CLV
        if customer:
            try:
                customer.customer_profile.update_clv()
            except Exception:
                pass

        logger.info(f'Order created: {order.order_number} (total: {order.grand_total})')
        return order

    # ─── Helpers ──────────────────────────────────────────────────────────

    def _get_cart(self):
        if self.user:
            return Cart.objects.filter(user=self.user).first()
        session_key = self.data.get('session_key', '')
        return Cart.objects.filter(session_key=session_key).first()

    def _get_inventory(self, cart_item):
        if cart_item.variant:
            try:
                return Inventory.objects.select_for_update().get(variant=cart_item.variant)
            except Inventory.DoesNotExist:
                pass
        try:
            return Inventory.objects.select_for_update().get(product=cart_item.product, variant=None)
        except Inventory.DoesNotExist:
            return None

    def _validate_coupon(self, code, customer, order_amount):
        """Server-side coupon validation. Returns (coupon, discount_amount)."""
        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            raise ValueError(f'Coupon "{code}" is invalid')

        if not coupon.is_valid_now:
            raise ValueError(f'Coupon "{code}" has expired or is inactive')

        if coupon.account_only and not customer:
            raise ValueError(f'Coupon "{code}" requires a registered account')

        if customer:
            # Check per-customer usage
            usage_count = CouponUsage.objects.filter(coupon=coupon, customer=customer).count()
            if usage_count >= coupon.per_customer_limit:
                raise ValueError(f'You have already used this coupon')

            # Check first-order-only
            if coupon.first_order_only:
                from apps.orders.models import Order
                if Order.objects.filter(customer=customer).exists():
                    raise ValueError(f'Coupon "{code}" is for first-time orders only')

            # Check customer restrictions
            if coupon.customer_restrictions.exists():
                if not coupon.customer_restrictions.filter(id=customer.id).exists():
                    raise ValueError(f'You are not eligible for this coupon')

        discount = coupon.calculate_discount(order_amount)
        return coupon, discount

    def _calculate_shipping(self, order_total):
        """Calculate shipping charge based on shipping zone/rate config."""
        city = self.data.get('city', '').strip().lower()
        area = self.data.get('area', '').strip().lower()

        # Find matching zone
        from apps.shipping.models import ShippingZone
        zone = None
        for z in ShippingZone.objects.filter(is_active=True).prefetch_related('rates'):
            cities = [c.strip().lower() for c in z.cities.split(',') if c.strip()]
            areas = [a.strip().lower() for a in z.areas.split(',') if a.strip()]
            if city in cities or area in areas:
                zone = z
                break

        if zone:
            rate = zone.rates.filter(is_active=True).first()
        else:
            # Default: first active rate
            from apps.shipping.models import ShippingRate
            rate = ShippingRate.objects.filter(is_active=True).first()

        if rate:
            return rate.calculate(order_total)
        return Decimal('0.00')

    def _calculate_risk_score(self, order):
        """Calculate fraud risk score for COD orders."""
        from apps.orders.models import BlockedPhone, BlockedAddress
        score = 0.0
        reasons = []

        if order.customer:
            # Check cancellation history
            from apps.orders.models import Order as OrderModel
            cancel_count = OrderModel.objects.filter(
                customer=order.customer, status='cancelled'
            ).count()
            total_orders = OrderModel.objects.filter(customer=order.customer).count()

            if total_orders > 3 and cancel_count > 0:
                cancel_rate = cancel_count / total_orders
                if cancel_rate > 0.5:
                    score += 40
                    reasons.append(f'High cancellation rate: {cancel_rate:.0%}')
                elif cancel_rate > 0.3:
                    score += 20
                    reasons.append(f'Elevated cancellation rate: {cancel_rate:.0%}')

        # Check blocked phone
        if BlockedPhone.objects.filter(phone=order.customer_phone, is_active=True).exists():
            score += 80
            reasons.append('Phone number is blocked')

        # Check blocked address
        address_hash = hashlib.sha256(
            order.shipping_address.lower().strip().encode()
        ).hexdigest()
        if BlockedAddress.objects.filter(address_hash=address_hash, is_active=True).exists():
            score += 70
            reasons.append('Shipping address is blocked')

        is_flagged = score >= 60
        OrderRiskScore.objects.create(
            order=order,
            score=score,
            reasons=reasons,
            is_flagged=is_flagged,
        )

        if is_flagged:
            order.is_flagged = True
            order.save(update_fields=['is_flagged'])
            # Alert admin via notification
            try:
                from apps.notifications.services import notify_suspicious_order
                notify_suspicious_order(order, reasons)
            except Exception:
                pass

        return score
