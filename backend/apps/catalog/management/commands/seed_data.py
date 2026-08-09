"""
Django Management Command to populate PriyoShop with expanded enterprise e-commerce seed data.
Run: python manage.py seed_data
"""
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.categories.models import Category, SubCategory
from apps.catalog.models import Brand
from apps.products.models import Product, ProductVariant, ProductImage, ProductBundle, BundleItem
from apps.inventory.models import Inventory
from apps.shipping.models import ShippingZone, ShippingRate
from apps.coupons.models import Coupon
from apps.discounts.models import AccountDiscountConfig
from apps.settings_manager.models import SiteSetting, SEOSetting, FooterSection, FooterLink
from apps.tracking.models import TrackingSetting
from apps.homepage.models import HomepageSection, HeroSlide, Banner, TrustFeature, AnnouncementBar
from apps.cms.models import CMSPage, Menu, MenuItem

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds database with expanded realistic enterprise e-commerce demo data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('[SEED] Expanding PriyoShop Enterprise Database...'))

        # 1. Admin & Customer Users
        admin_user, _ = User.objects.get_or_create(
            email='admin@priyoshop.com',
            defaults={
                'first_name': 'Super',
                'last_name': 'Admin',
                'phone': '01700000000',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        demo_customer, _ = User.objects.get_or_create(
            email='customer@example.com',
            defaults={
                'first_name': 'Rahim',
                'last_name': 'Uddin',
                'phone': '01811112222',
                'is_verified': True,
            }
        )
        demo_customer.set_password('customer123')
        demo_customer.save()

        # 2. Site & SEO Settings
        SiteSetting.objects.get_or_create(id=1, defaults={
            'site_name': 'PriyoShop',
            'tagline': 'Premium Online Shopping in Bangladesh',
            'email': 'support@priyoshop.com',
            'phone': '+880 9612 345678',
            'address': 'Plot 15, Block B, Banani, Dhaka-1213, Bangladesh',
            'currency_code': 'BDT',
            'currency_symbol': '৳',
            'account_discount_enabled': True,
            'cod_enabled': True,
        })

        SEOSetting.objects.get_or_create(id=1, defaults={
            'site_title': 'PriyoShop — Modern E-Commerce Platform',
            'meta_description': 'Shop top quality electronics, fashion, home essentials & lifestyle products at best prices in Bangladesh.',
            'meta_keywords': 'priyoshop, ecommerce, online shopping bangladesh, electronics, fashion, cod',
        })

        TrackingSetting.objects.get_or_create(id=1, defaults={
            'ga4_enabled': True,
            'ga4_measurement_id': 'G-DEMO123456',
            'gtm_enabled': True,
            'gtm_container_id': 'GTM-DEMO789',
            'meta_pixel_enabled': True,
            'meta_pixel_id': '123456789012345',
        })

        AccountDiscountConfig.objects.get_or_create(id=1, defaults={
            'is_enabled': True,
            'discount_percentage': Decimal('2.00'),
            'minimum_order_value': Decimal('500.00'),
        })

        # 3. Shipping Zones & Rates
        dhaka_zone, _ = ShippingZone.objects.get_or_create(
            name='Inside Dhaka',
            defaults={'cities': 'Dhaka', 'areas': 'Banani, Gulshan, Uttara, Dhanmondi, Mirpur'}
        )
        ShippingRate.objects.get_or_create(
            zone=dhaka_zone, name='Standard Express',
            defaults={'rate': Decimal('60.00'), 'free_shipping_threshold': Decimal('2000.00'), 'estimated_days_min': 1, 'estimated_days_max': 2}
        )

        outside_zone, _ = ShippingZone.objects.get_or_create(
            name='Outside Dhaka',
            defaults={'cities': 'Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur'}
        )
        ShippingRate.objects.get_or_create(
            zone=outside_zone, name='Courier Delivery',
            defaults={'rate': Decimal('120.00'), 'free_shipping_threshold': Decimal('3500.00'), 'estimated_days_min': 2, 'estimated_days_max': 4}
        )

        # 4. Brands
        apple, _ = Brand.objects.get_or_create(name='Apple', defaults={'slug': 'apple', 'is_featured': True})
        samsung, _ = Brand.objects.get_or_create(name='Samsung', defaults={'slug': 'samsung', 'is_featured': True})
        sony, _ = Brand.objects.get_or_create(name='Sony', defaults={'slug': 'sony', 'is_featured': True})
        nike, _ = Brand.objects.get_or_create(name='Nike', defaults={'slug': 'nike', 'is_featured': True})
        adidas, _ = Brand.objects.get_or_create(name='Adidas', defaults={'slug': 'adidas', 'is_featured': True})
        lg, _ = Brand.objects.get_or_create(name='LG Electronics', defaults={'slug': 'lg-electronics', 'is_featured': True})
        walton, _ = Brand.objects.get_or_create(name='Walton', defaults={'slug': 'walton', 'is_featured': True})
        loreal, _ = Brand.objects.get_or_create(name='L\'Oreal Paris', defaults={'slug': 'loreal-paris', 'is_featured': True})

        # 5. Categories & Subcategories
        # Category 1: Electronics
        c_electronics, _ = Category.objects.get_or_create(
            slug='electronics', defaults={'name': 'Gadgets & Electronics', 'icon': 'Smartphone', 'sort_order': 1}
        )
        sub_smartphones, _ = SubCategory.objects.get_or_create(
            slug='smartphones', defaults={'category': c_electronics, 'name': 'Smartphones', 'sort_order': 1}
        )
        sub_laptops, _ = SubCategory.objects.get_or_create(
            slug='laptops', defaults={'category': c_electronics, 'name': 'Laptops & Computers', 'sort_order': 2}
        )
        sub_audio, _ = SubCategory.objects.get_or_create(
            slug='audio-headphones', defaults={'category': c_electronics, 'name': 'Audio & Headphones', 'sort_order': 3}
        )
        sub_smartwatches, _ = SubCategory.objects.get_or_create(
            slug='smartwatches', defaults={'category': c_electronics, 'name': 'Smartwatches & Wearables', 'sort_order': 4}
        )

        # Category 2: Fashion & Apparel
        c_fashion, _ = Category.objects.get_or_create(
            slug='fashion', defaults={'name': 'Fashion & Apparel', 'icon': 'Shirt', 'sort_order': 2}
        )
        sub_mens_clothing, _ = SubCategory.objects.get_or_create(
            slug='mens-clothing', defaults={'category': c_fashion, 'name': "Men's Clothing", 'sort_order': 1}
        )
        sub_womens_fashion, _ = SubCategory.objects.get_or_create(
            slug='womens-fashion', defaults={'category': c_fashion, 'name': "Women's Fashion", 'sort_order': 2}
        )
        sub_footwear, _ = SubCategory.objects.get_or_create(
            slug='footwear', defaults={'category': c_fashion, 'name': 'Footwear & Sneakers', 'sort_order': 3}
        )

        # Category 3: Home & Kitchen Appliances
        c_home, _ = Category.objects.get_or_create(
            slug='home-appliances', defaults={'name': 'Home & Kitchen Appliances', 'icon': 'Home', 'sort_order': 3}
        )
        sub_kitchen, _ = SubCategory.objects.get_or_create(
            slug='kitchen-appliances', defaults={'category': c_home, 'name': 'Kitchen Appliances', 'sort_order': 1}
        )
        sub_cooling, _ = SubCategory.objects.get_or_create(
            slug='ac-cooling', defaults={'category': c_home, 'name': 'Air Conditioners & Fans', 'sort_order': 2}
        )

        # Category 4: Health & Beauty
        c_beauty, _ = Category.objects.get_or_create(
            slug='health-beauty', defaults={'name': 'Health & Beauty', 'icon': 'Heart', 'sort_order': 4}
        )
        sub_skincare, _ = SubCategory.objects.get_or_create(
            slug='skincare-cosmetics', defaults={'category': c_beauty, 'name': 'Skincare & Cosmetics', 'sort_order': 1}
        )
        sub_fragrances, _ = SubCategory.objects.get_or_create(
            slug='perfumes', defaults={'category': c_beauty, 'name': 'Perfumes & Fragrances', 'sort_order': 2}
        )

        # Category 5: Groceries & Superstore
        c_grocery, _ = Category.objects.get_or_create(
            slug='groceries', defaults={'name': 'Groceries & Superstore', 'icon': 'ShoppingBag', 'sort_order': 5}
        )
        sub_beverages, _ = SubCategory.objects.get_or_create(
            slug='beverages', defaults={'category': c_grocery, 'name': 'Beverages & Drinks', 'sort_order': 1}
        )
        sub_snacks, _ = SubCategory.objects.get_or_create(
            slug='snacks', defaults={'category': c_grocery, 'name': 'Snacks & Confectionery', 'sort_order': 2}
        )

        # Category 6: Sports & Outdoors
        c_sports, _ = Category.objects.get_or_create(
            slug='sports-fitness', defaults={'name': 'Sports & Fitness', 'icon': 'Activity', 'sort_order': 6}
        )
        sub_fitness, _ = SubCategory.objects.get_or_create(
            slug='gym-equipment', defaults={'category': c_sports, 'name': 'Gym & Fitness Equipment', 'sort_order': 1}
        )

        # 6. Sample Products Population

        # --- ELECTRONICS PRODUCTS ---
        p1, _ = Product.objects.get_or_create(
            slug='iphone-15-pro-max',
            defaults={
                'name': 'iPhone 15 Pro Max 256GB Natural Titanium',
                'sku': 'IPH15PM-256-NT',
                'category': c_electronics,
                'subcategory': sub_smartphones,
                'brand': apple,
                'short_description': 'A17 Pro chip, titanium design, 48MP main camera with 5x Telephoto lens.',
                'description': 'Experience breakthrough performance and unprecedented camera capabilities with iPhone 15 Pro Max.',
                'buying_price': Decimal('135000.00'),
                'admin_price': Decimal('145000.00'),
                'published_price': Decimal('165000.00'),
                'discount_price': Decimal('158000.00'),
                'status': 'active',
                'is_active': True,
                'is_featured': True,
                'is_trending': True,
                'is_bestseller': True,
                'units_sold': 42,
                'revenue_total': Decimal('6636000.00'),
                'profit_total': Decimal('966000.00')
            }
        )
        Inventory.objects.update_or_create(product=p1, defaults={'quantity': 25})

        p2, _ = Product.objects.get_or_create(
            slug='samsung-galaxy-s24-ultra',
            defaults={
                'name': 'Samsung Galaxy S24 Ultra 12GB/512GB Titanium Gray',
                'sku': 'S24U-512-GY',
                'category': c_electronics,
                'subcategory': sub_smartphones,
                'brand': samsung,
                'short_description': 'Galaxy AI is here. Epic 200MP camera, built-in S Pen.',
                'buying_price': Decimal('125000.00'),
                'published_price': Decimal('155000.00'),
                'discount_price': Decimal('148000.00'),
                'status': 'active',
                'is_active': True,
                'is_featured': True,
                'is_trending': True,
                'units_sold': 28,
            }
        )
        Inventory.objects.update_or_create(product=p2, defaults={'quantity': 18})

        p3, _ = Product.objects.get_or_create(
            slug='sony-wh-1000xm5-headphones',
            defaults={
                'name': 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
                'sku': 'SONY-XM5-BLK',
                'category': c_electronics,
                'subcategory': sub_audio,
                'brand': sony,
                'short_description': 'Industry-leading noise canceling with Auto NC Optimizer and crystal-clear hands-free calling.',
                'buying_price': Decimal('32000.00'),
                'published_price': Decimal('42000.00'),
                'discount_price': Decimal('38990.00'),
                'status': 'active',
                'is_active': True,
                'is_featured': True,
                'is_new_arrival': True,
                'units_sold': 64,
            }
        )
        Inventory.objects.update_or_create(product=p3, defaults={'quantity': 35})

        p4, _ = Product.objects.get_or_create(
            slug='apple-watch-ultra-2',
            defaults={
                'name': 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium Case',
                'sku': 'AW-ULTRA2-49',
                'category': c_electronics,
                'subcategory': sub_smartwatches,
                'brand': apple,
                'short_description': 'The most capable and rugged Apple Watch ever. Designed for outdoor adventures and endurance sports.',
                'buying_price': Decimal('82000.00'),
                'published_price': Decimal('99000.00'),
                'discount_price': Decimal('94500.00'),
                'status': 'active',
                'is_active': True,
                'is_trending': True,
                'units_sold': 19,
            }
        )
        Inventory.objects.update_or_create(product=p4, defaults={'quantity': 12})

        # --- FASHION PRODUCTS ---
        p5, _ = Product.objects.get_or_create(
            slug='nike-air-force-1-07',
            defaults={
                'name': 'Nike Air Force 1 \'07 Triple White Sneakers',
                'sku': 'AF1-07-WHT',
                'category': c_fashion,
                'subcategory': sub_footwear,
                'brand': nike,
                'short_description': 'Classic style, comfortable cushioning, crisp leather upper.',
                'buying_price': Decimal('8500.00'),
                'published_price': Decimal('12500.00'),
                'discount_price': Decimal('10990.00'),
                'status': 'active',
                'is_active': True,
                'is_bestseller': True,
                'is_new_arrival': True,
                'units_sold': 85,
            }
        )
        Inventory.objects.update_or_create(product=p5, defaults={'quantity': 50})

        p6, _ = Product.objects.get_or_create(
            slug='adidas-ultraboost-light',
            defaults={
                'name': 'Adidas Ultraboost Light Running Shoes',
                'sku': 'ADI-UB-LGT-01',
                'category': c_fashion,
                'subcategory': sub_footwear,
                'brand': adidas,
                'short_description': 'Experience epic energy with the lightest Ultraboost ever made.',
                'buying_price': Decimal('11000.00'),
                'published_price': Decimal('16500.00'),
                'discount_price': Decimal('14900.00'),
                'status': 'active',
                'is_active': True,
                'is_featured': True,
                'units_sold': 31,
            }
        )
        Inventory.objects.update_or_create(product=p6, defaults={'quantity': 22})

        # --- HOME & KITCHEN PRODUCTS ---
        p7, _ = Product.objects.get_or_create(
            slug='lg-inverter-split-ac-1-5-ton',
            defaults={
                'name': 'LG Dual Inverter 1.5 Ton Dual Cool AC (Dual Protection Filter)',
                'sku': 'LG-AC-1.5T-INV',
                'category': c_home,
                'subcategory': sub_cooling,
                'brand': lg,
                'short_description': '70% energy saving with 40% faster cooling capability and HD air purification filter.',
                'buying_price': Decimal('52000.00'),
                'published_price': Decimal('68000.00'),
                'discount_price': Decimal('63500.00'),
                'status': 'active',
                'is_active': True,
                'is_trending': True,
                'units_sold': 15,
            }
        )
        Inventory.objects.update_or_create(product=p7, defaults={'quantity': 10})

        p8, _ = Product.objects.get_or_create(
            slug='walton-digital-rice-cooker-2-8l',
            defaults={
                'name': 'Walton Smart Digital Rice Cooker 2.8 Liter Non-Stick',
                'sku': 'WALT-RC-28L',
                'category': c_home,
                'subcategory': sub_kitchen,
                'brand': walton,
                'short_description': 'Automatic warm keeping function with durable honeycomb inner pot.',
                'buying_price': Decimal('2800.00'),
                'published_price': Decimal('4200.00'),
                'discount_price': Decimal('3650.00'),
                'status': 'active',
                'is_active': True,
                'is_bestseller': True,
                'units_sold': 142,
            }
        )
        Inventory.objects.update_or_create(product=p8, defaults={'quantity': 60})

        # --- BEAUTY & HEALTH PRODUCTS ---
        p9, _ = Product.objects.get_or_create(
            slug='loreal-revitalift-hyaluronic-acid-serum',
            defaults={
                'name': 'L\'Oreal Paris Revitalift 1.5% Pure Hyaluronic Acid Serum 30ml',
                'sku': 'LOR-REV-SER-30',
                'category': c_beauty,
                'subcategory': sub_skincare,
                'brand': loreal,
                'short_description': 'Dermatologist tested anti-aging face serum that intensely hydrates and plumps skin.',
                'buying_price': Decimal('1200.00'),
                'published_price': Decimal('1950.00'),
                'discount_price': Decimal('1690.00'),
                'status': 'active',
                'is_active': True,
                'is_featured': True,
                'units_sold': 95,
            }
        )
        Inventory.objects.update_or_create(product=p9, defaults={'quantity': 45})

        # 7. Coupons
        Coupon.objects.get_or_create(
            code='WELCOME10',
            defaults={
                'name': 'Welcome 10% Discount',
                'coupon_type': 'percentage',
                'discount_value': Decimal('10.00'),
                'minimum_order_value': Decimal('1000.00'),
                'maximum_discount': Decimal('500.00'),
                'is_active': True,
            }
        )

        Coupon.objects.get_or_create(
            code='EID2026',
            defaults={
                'name': 'Special Eid Celebration Coupon',
                'coupon_type': 'fixed',
                'discount_value': Decimal('300.00'),
                'minimum_order_value': Decimal('2500.00'),
                'is_active': True,
            }
        )

        # 8. Homepage CMS Layout
        AnnouncementBar.objects.get_or_create(
            id=1,
            defaults={
                'text': '🎉 Special Eid Offer: Get Extra 2% Account Discount + Free Express Delivery inside Dhaka!',
                'link_text': 'Shop Now',
                'link_url': '/shop',
                'is_active': True
            }
        )

        hero_sec, _ = HomepageSection.objects.get_or_create(
            section_type='hero', title='Hero Carousel', defaults={'sort_order': 1, 'is_active': True}
        )
        HeroSlide.objects.get_or_create(
            section=hero_sec,
            title='Next-Gen Smartphones & Modern Lifestyle',
            defaults={
                'subtitle': 'Upgrade your lifestyle with official brand warranty & instant cash on delivery across Bangladesh.',
                'image': 'hero/slide1.jpg',
                'cta_text': 'Explore Offers',
                'cta_url': '/shop?category=electronics',
                'sort_order': 1
            }
        )

        trust_sec, _ = HomepageSection.objects.get_or_create(
            section_type='trust_features', title='Why Choose PriyoShop', defaults={'sort_order': 2, 'is_active': True}
        )
        TrustFeature.objects.get_or_create(section=trust_sec, title='Free & Fast Shipping', defaults={'description': 'Free shipping on orders above ৳2000', 'icon': 'Truck', 'sort_order': 1})
        TrustFeature.objects.get_or_create(section=trust_sec, title='100% Authentic Products', defaults={'description': 'Direct from authorized brand distributors', 'icon': 'ShieldCheck', 'sort_order': 2})
        TrustFeature.objects.get_or_create(section=trust_sec, title='Cash on Delivery', defaults={'description': 'Inspect item before payment at your doorstep', 'icon': 'Banknote', 'sort_order': 3})

        # 9. CMS Pages
        CMSPage.objects.get_or_create(
            slug='about-us',
            defaults={
                'title': 'About Us',
                'content': 'PriyoShop is Bangladesh\'s leading enterprise e-commerce platform dedicated to providing genuine products, transparent pricing, and fast nationwide delivery.',
                'is_published': True,
                'is_system': True,
            }
        )
        CMSPage.objects.get_or_create(
            slug='privacy-policy',
            defaults={
                'title': 'Privacy Policy',
                'content': 'We respect your privacy. All customer data, shipping details, and transactions are encrypted and handled with high security standards.',
                'is_published': True,
                'is_system': True,
            }
        )

        self.stdout.write(self.style.SUCCESS('[SUCCESS] Database successfully seeded with 6 major categories and multi-brand product catalog!'))
        self.stdout.write(self.style.SUCCESS('[LOGIN] Admin Login: admin@priyoshop.com / admin123'))
        self.stdout.write(self.style.SUCCESS('[LOGIN] Customer Login: customer@example.com / customer123'))
