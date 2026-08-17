"""
Shipping & Delivery Calculation Services.
Provides WeightCalculator and DeliveryCalculator engines.
"""
from decimal import Decimal
from typing import List, Dict, Any, Tuple
from apps.shipping.models import WeightDeliveryTier, ShippingZone, ShippingRate
from apps.settings_manager.models import SiteSetting


class WeightCalculator:
    """Calculates physical and chargeable weights for individual items and entire carts."""

    @staticmethod
    def normalize_to_grams(
        measurement_type: str,
        measurement_value: Any,
        measurement_unit: str,
        density_g_per_ml: Any = 1.0
    ) -> Decimal:
        """Convert any weight or volume measurement into standard grams."""
        val = Decimal(str(measurement_value or 0))
        m_type = (measurement_type or 'weight').lower()
        unit = (measurement_unit or 'g').lower()
        density = Decimal(str(density_g_per_ml or 1.0))
        if density <= 0:
            density = Decimal('1.000')

        if m_type == 'volume':
            if unit in ['litre', 'l']:
                return (val * Decimal('1000') * density).quantize(Decimal('0.001'))
            else: # ml
                return (val * density).quantize(Decimal('0.001'))
        else: # weight
            if unit == 'kg':
                return (val * Decimal('1000')).quantize(Decimal('0.001'))
            elif unit == 'g':
                return val.quantize(Decimal('0.001'))
            return val.quantize(Decimal('0.001'))

    @classmethod
    def calculate_item_weights(cls, item) -> Tuple[Decimal, Decimal]:
        """
        Given a cart item or order item (with .product and .quantity),
        returns (total_physical_weight_grams, total_chargeable_weight_grams).
        """
        product = getattr(item, 'product', None)
        if not product:
            return Decimal('0.000'), Decimal('0.000')

        qty = getattr(item, 'quantity', 1)
        qty_dec = Decimal(str(qty))

        # Use normalized_weight_grams if present, otherwise calculate
        unit_weight = getattr(product, 'normalized_weight_grams', None)
        if unit_weight is None or unit_weight <= 0:
            unit_weight = cls.normalize_to_grams(
                getattr(product, 'measurement_type', 'weight'),
                getattr(product, 'measurement_value', 0),
                getattr(product, 'measurement_unit', 'g'),
                getattr(product, 'density_g_per_ml', 1.0)
            )

        total_physical = (unit_weight * qty_dec).quantize(Decimal('0.001'))
        is_applicable = getattr(product, 'delivery_charge_applicable', True)

        total_chargeable = total_physical if is_applicable else Decimal('0.000')
        return total_physical, total_chargeable


class DeliveryCalculator:
    """
    Enterprise delivery fee calculator.
    Handles:
    1. Single-product free delivery rule ('free_delivery_when_alone')
    2. Weight/Volume-based pricing tiers ('WeightDeliveryTier')
    3. Excluded/exempt products ('delivery_charge_applicable' == False)
    4. Fallback zone/flat rates
    """

    @classmethod
    def calculate(
        cls,
        items: List[Any],
        subtotal: Decimal = Decimal('0.00'),
        city: str = 'Dhaka',
        area: str = '',
        customer: Any = None
    ) -> Dict[str, Any]:
        """
        Main calculation engine.
        `items` can be a list of CartItem objects or dictionaries with product references.
        """
        if not items:
            return {
                'delivery_charge': Decimal('0.00'),
                'delivery_charge_reason': 'empty_cart',
                'is_single_product_free_delivery': False,
                'total_physical_weight_grams': Decimal('0.000'),
                'chargeable_weight_grams': Decimal('0.000'),
                'chargeable_weight_kg': Decimal('0.000'),
            }

        # Step 1: Count unique product types
        unique_product_ids = set()
        for item in items:
            p_id = getattr(item, 'product_id', None)
            if not p_id and hasattr(item, 'product') and item.product:
                p_id = item.product.id
            if p_id:
                unique_product_ids.add(p_id)

        # Step 2: Calculate total physical and chargeable weights
        total_physical_weight = Decimal('0.000')
        total_chargeable_weight = Decimal('0.000')

        for item in items:
            item_phys, item_charge = WeightCalculator.calculate_item_weights(item)
            total_physical_weight += item_phys
            total_chargeable_weight += item_charge

        # Step 3: Check Rule 1 — Single Product Free Delivery
        # If order contains ONLY ONE UNIQUE PRODUCT TYPE (regardless of quantity)
        # AND that product has `free_delivery_when_alone == True` -> ৳0 Delivery
        if len(unique_product_ids) == 1:
            first_item = items[0]
            first_product = getattr(first_item, 'product', None)
            if first_product and getattr(first_product, 'free_delivery_when_alone', False):
                return {
                    'delivery_charge': Decimal('0.00'),
                    'delivery_charge_reason': 'single_product_free_delivery',
                    'is_single_product_free_delivery': True,
                    'total_physical_weight_grams': total_physical_weight,
                    'chargeable_weight_grams': Decimal('0.000'), # waived
                    'chargeable_weight_kg': Decimal('0.000'),
                }

        # Step 4: If all items in cart have delivery_charge_applicable = False
        if total_chargeable_weight <= 0:
            return {
                'delivery_charge': Decimal('0.00'),
                'delivery_charge_reason': 'all_items_exempt',
                'is_single_product_free_delivery': False,
                'total_physical_weight_grams': total_physical_weight,
                'chargeable_weight_grams': Decimal('0.000'),
                'chargeable_weight_kg': Decimal('0.000'),
            }

        # Step 5: Check Weight Delivery Tiers
        active_tiers = WeightDeliveryTier.objects.filter(is_active=True).order_by('sort_order', 'min_weight_grams')
        matched_tier = None

        for tier in active_tiers:
            min_w = tier.min_weight_grams or Decimal('0.00')
            max_w = tier.max_weight_grams

            # Tier 1 (starts at 0): 0 <= weight <= max_w
            if min_w == Decimal('0.00'):
                if max_w is None or total_chargeable_weight <= max_w:
                    matched_tier = tier
                    break
            else:
                # Subsequent tiers: min_w < weight <= max_w (or weight > min_w if max_w is None)
                if max_w is None:
                    if total_chargeable_weight > min_w or total_chargeable_weight >= min_w:
                        matched_tier = tier
                        break
                elif min_w < total_chargeable_weight <= max_w:
                    matched_tier = tier
                    break
                elif min_w <= total_chargeable_weight <= max_w:
                    # fallback for discrete decimal definitions
                    matched_tier = tier
                    break

        if matched_tier:
            return {
                'delivery_charge': matched_tier.charge,
                'delivery_charge_reason': 'weight_based_delivery',
                'is_single_product_free_delivery': False,
                'total_physical_weight_grams': total_physical_weight,
                'chargeable_weight_grams': total_chargeable_weight,
                'chargeable_weight_kg': (total_chargeable_weight / Decimal('1000')).quantize(Decimal('0.001')),
                'delivery_tier_name': matched_tier.name,
                'delivery_tier_min_weight': matched_tier.min_weight_grams,
                'delivery_tier_max_weight': matched_tier.max_weight_grams,
                'tier_name': matched_tier.name,
            }

        # Step 6: Fallback to Zone / Site Settings
        city_lower = (city or '').strip().lower()
        if city_lower == 'dhaka':
            fallback_charge = Decimal('60.00')
        else:
            fallback_charge = Decimal('120.00')

        return {
            'delivery_charge': fallback_charge,
            'delivery_charge_reason': 'zone_flat_rate',
            'is_single_product_free_delivery': False,
            'total_physical_weight_grams': total_physical_weight,
            'chargeable_weight_grams': total_chargeable_weight,
            'chargeable_weight_kg': (total_chargeable_weight / Decimal('1000')).quantize(Decimal('0.001')),
            'delivery_tier_name': 'Flat Rate',
            'delivery_tier_min_weight': None,
            'delivery_tier_max_weight': None,
            'tier_name': 'Flat Rate',
        }

