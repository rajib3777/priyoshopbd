export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  full_name: string;
  is_staff: boolean;
  is_verified: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  icon?: string;
  product_count: number;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_count: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  color?: string;
  size?: string;
  published_price: string;
  discount_price?: string;
  effective_price: string;
  available_stock: number;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: number | Category;
  category_name?: string;
  brand_name?: string;
  short_description: string;
  description: string;
  specifications?: Array<{ label: string; value: string }>;
  published_price: string;
  discount_price?: string;
  effective_price: string;
  discount_percentage: number;
  primary_image?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  is_featured: boolean;
  is_trending: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_flash_sale: boolean;
  available_stock: number;
  view_count: number;
  related_products?: Product[];
}

export interface CartItem {
  id: number;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface Cart {
  id: number;
  session_key: string;
  items: CartItem[];
  subtotal: string;
  item_count: number;
  coupon_code?: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address: string;
  shipping_city: string;
  subtotal: string;
  discount_amount: string;
  coupon_discount: string;
  account_discount: string;
  shipping_charge: string;
  grand_total: string;
  coupon_code_used?: string;
  items: OrderItem[];
  is_flagged: boolean;
  created_at: string;
}

export interface CMSPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  template: string;
  is_published: boolean;
}

export interface ReturnRequest {
  id: number;
  order: number;
  order_number: string;
  return_type: string;
  status: string;
  reason_name: string;
  customer_note: string;
  total_return_amount: string;
  created_at: string;
}

export interface SystemHealth {
  status: string;
  timestamp: number;
  services: {
    database: { status: string; latency_ms: number };
    redis: { status: string };
    celery: { status: string };
  };
  metrics: {
    media_storage_mb: number;
    errors_24h: number;
    total_orders: number;
    pending_orders: number;
    flagged_orders: number;
  };
  backup: {
    status: string;
    last_run?: string;
    verified: boolean;
  };
}
