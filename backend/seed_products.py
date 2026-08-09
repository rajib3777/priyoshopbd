import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.products.models import Product
from apps.categories.models import Category
from decimal import Decimal

cat_him = Category.objects.get(id=7)
cat_her = Category.objects.get(id=8)
cat_muslim = Category.objects.get(id=9)
cat_daily = Category.objects.get(id=10)

new_products = [
  # For Him
  dict(name='Xiaomi 14 Ultra 16GB/512GB Titan Black', category=cat_him, published_price=Decimal('89999'), discount_price=Decimal('84999'), is_featured=True, is_trending=True, is_new_arrival=True, is_flash_sale=False, description='Xiaomi 14 Ultra with Leica camera system and Snapdragon 8 Gen 3 processor'),
  dict(name='OnePlus 12 16GB/512GB Silky Black', category=cat_him, published_price=Decimal('74999'), discount_price=None, is_featured=False, is_trending=True, is_new_arrival=True, is_flash_sale=False, description='OnePlus 12 with Snapdragon 8 Gen 3 and 50MP Hasselblad Camera'),
  dict(name='Bose QuietComfort 45 Wireless Headphones', category=cat_him, published_price=Decimal('34999'), discount_price=Decimal('29999'), is_featured=True, is_trending=False, is_new_arrival=False, is_flash_sale=True, description='World-class noise cancellation headphones with 24hr battery'),
  dict(name='Samsung Galaxy Watch 6 Classic 47mm', category=cat_him, published_price=Decimal('39999'), discount_price=Decimal('34999'), is_featured=False, is_trending=True, is_new_arrival=True, is_flash_sale=False, description='Samsung Galaxy Watch 6 Classic with rotating bezel and health tracking'),

  # For Her
  dict(name='Dyson Airwrap Multi-Styler Complete Long', category=cat_her, published_price=Decimal('62999'), discount_price=Decimal('54999'), is_featured=True, is_trending=True, is_new_arrival=False, is_flash_sale=False, description='Dyson Airwrap for all hair types - styles and dries simultaneously'),
  dict(name='ASUS ZenBook 14 OLED Laptop i7 16GB 512GB', category=cat_her, published_price=Decimal('99999'), discount_price=Decimal('89999'), is_featured=True, is_trending=False, is_new_arrival=True, is_flash_sale=False, description='ASUS ZenBook with stunning OLED display and Intel Core i7'),
  dict(name='Philips EasySpeed Steam Iron GC1750', category=cat_her, published_price=Decimal('4500'), discount_price=Decimal('3499'), is_featured=False, is_trending=False, is_new_arrival=True, is_flash_sale=True, description='Philips steam iron with powerful steam and non-stick soleplate'),
  dict(name='Xiaomi Smart Band 8 Fitness Tracker Black', category=cat_her, published_price=Decimal('5999'), discount_price=Decimal('4999'), is_featured=False, is_trending=True, is_new_arrival=True, is_flash_sale=True, description='Xiaomi Smart Band 8 with 1.62 inch AMOLED display and 16-day battery'),

  # I am a Muslim
  dict(name='Zamzam Prayer Mat Premium Velvet Green', category=cat_muslim, published_price=Decimal('1500'), discount_price=Decimal('999'), is_featured=True, is_trending=True, is_new_arrival=True, is_flash_sale=True, description='Premium velvet prayer mat with anti-slip base and embroidered design'),
  dict(name='Al-Quran Tafseer Bangla Large Print Edition', category=cat_muslim, published_price=Decimal('2000'), discount_price=Decimal('1499'), is_featured=True, is_trending=False, is_new_arrival=False, is_flash_sale=False, description='Complete Al-Quran with Bangla tafseer and commentary'),
  dict(name='Islamic Perfume Oud Al Layl 100ml EDP', category=cat_muslim, published_price=Decimal('3999'), discount_price=Decimal('2999'), is_featured=False, is_trending=True, is_new_arrival=True, is_flash_sale=False, description='Authentic Arabic oud perfume long lasting 24hr fragrance'),
  dict(name='Jersey Hijab Set of 3 Black White Nude', category=cat_muslim, published_price=Decimal('1299'), discount_price=Decimal('899'), is_featured=False, is_trending=True, is_new_arrival=True, is_flash_sale=True, description='Soft stretchy jersey hijab set of 3 colors - Black, White, Nude'),

  # Daily Needs
  dict(name='Walton WM-GFL80H Front Load Washing Machine', category=cat_daily, published_price=Decimal('52000'), discount_price=Decimal('42999'), is_featured=True, is_trending=False, is_new_arrival=True, is_flash_sale=False, description='Walton 8kg front load washing machine with energy saving mode'),
  dict(name='RFL Titan Pressure Cooker 5 Litre Silver', category=cat_daily, published_price=Decimal('2200'), discount_price=Decimal('1799'), is_featured=False, is_trending=True, is_new_arrival=False, is_flash_sale=True, description='Premium aluminum pressure cooker with safety valve and steam whistle'),
  dict(name='Khadi Natural Aloe Vera Face Wash 200ml', category=cat_daily, published_price=Decimal('699'), discount_price=Decimal('499'), is_featured=False, is_trending=True, is_new_arrival=True, is_flash_sale=True, description='Natural aloe vera face wash for all skin types - paraben free'),
  dict(name='Surf Excel Matic Liquid Detergent 3L Refill', category=cat_daily, published_price=Decimal('750'), discount_price=Decimal('599'), is_featured=False, is_trending=False, is_new_arrival=True, is_flash_sale=False, description='Surf Excel liquid detergent refill pack for front and top load machine'),
  dict(name='Pran Mango Juice 1L Tetra Pack Bundle 6pcs', category=cat_daily, published_price=Decimal('600'), discount_price=Decimal('480'), is_featured=False, is_trending=True, is_new_arrival=False, is_flash_sale=True, description='Fresh mango juice bundle pack of 6 tetra packs'),
]

created = 0
skipped = 0
for data in new_products:
    slug = data['name'].lower()
    for ch in [' ', '/', '(', ')', ',', '.', "'", '"']:
        slug = slug.replace(ch, '-')
    slug = slug[:80].strip('-')
    
    if Product.objects.filter(slug=slug).exists():
        skipped += 1
        continue
    
    prefix = data['name'][:4].upper().replace(' ', '')
    sku = f"PS-{prefix}-{uuid.uuid4().hex[:6].upper()}"
    
    p = Product(
        name=data['name'],
        slug=slug,
        sku=sku,
        category=data['category'],
        published_price=data['published_price'],
        discount_price=data.get('discount_price'),
        is_active=True,
        status='active',
        is_featured=data['is_featured'],
        is_trending=data['is_trending'],
        is_new_arrival=data['is_new_arrival'],
        is_flash_sale=data['is_flash_sale'],
        description=data['description'],
    )
    p.save()
    created += 1

print(f"Created: {created}  |  Skipped (exist): {skipped}")
print(f"Total active products: {Product.objects.filter(is_active=True).count()}")
print()
for c in [cat_him, cat_her, cat_muslim, cat_daily]:
    cnt = Product.objects.filter(category=c, is_active=True).count()
    print(f"  {c.name}: {cnt} products")
print()
print(f"  Featured:    {Product.objects.filter(is_featured=True, is_active=True).count()}")
print(f"  Trending:    {Product.objects.filter(is_trending=True, is_active=True).count()}")
print(f"  New Arrival: {Product.objects.filter(is_new_arrival=True, is_active=True).count()}")
print(f"  Flash Sale:  {Product.objects.filter(is_flash_sale=True, is_active=True).count()}")
