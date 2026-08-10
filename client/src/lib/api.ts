/**
 * Central API client for the REST backend.
 * Manages JWT token storage and attaches it to all authenticated requests.
 */

const API_BASE = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5008/api';
const TOKEN_KEY = 'neverbefore_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface FetchOptions extends RequestInit {
  auth?: boolean;
  allowNotFound?: boolean;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = false, allowNotFound = false, headers = {}, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });

  if (!res.ok) {
    if (allowNotFound && res.status === 404) {
      return null as T;
    }
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
      if (body.message) message = body.message;
    } catch { /* ignore parse error */ }
    throw new Error(message);
  }

  const body = await res.json();
  if (body && typeof body === 'object') {
    if ('success' in body && 'token' in body && 'user' in body) {
      return body as T;
    }
    if ('success' in body && 'order' in body) {
      return ((body as { order: T }).order ?? body) as T;
    }
    if ('success' in body && 'product' in body) {
      return ((body as { product: T }).product ?? body) as T;
    }
    if ('success' in body && 'products' in body) {
      return (body as { products: T }).products;
    }
    if ('success' in body && 'orders' in body) {
      return (body as { orders: T }).orders;
    }
    if ('success' in body && 'content' in body) {
      return (body as { content: T }).content;
    }
    if ('success' in body && 'data' in body) {
      return (body as { data: T }).data;
    }
  }
  return body as T;
}

/* ── Auth ─────────────────────────────────────────── */
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'customer';
  isAdmin?: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  signup: (email: string, password: string, fullName?: string, phone?: string) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, phone, number: phone }),
    }),
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch<{ success: boolean }>('/auth/logout', { method: 'POST', auth: true }),
};

/* ── Products ─────────────────────────────────────── */
export interface Product {
  _id: string;
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface SiteCategoryContent {
  name: string;
  image_url: string;
  description: string;
}

export interface SiteContent {
  _id: string;
  key: string;
  brand_name: string;
  brand_tagline: string;
  logo_url: string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_label: string;
  hero_cta_href: string;
  hero_images: string[];
  category_heading: string;
  category_subtitle: string;
  shop_heading: string;
  shop_subheading: string;
  empty_title: string;
  empty_message: string;
  footer_note: string;
  copyright_prefix: string;
  contact_heading: string;
  contact_note: string;
  support_email: string;
  support_phone: string;
  navigation_home: string;
  navigation_shop: string;
  navigation_cart: string;
  navigation_contact: string;
  navigation_categories: string;
  navigation_orders: string;
  admin_access_title: string;
  admin_access_message: string;
  admin_access_note: string;
  categories: SiteCategoryContent[];
}

export const productsApi = {
  list: () => apiFetch<Product[]>('/product/products'),
  get: (id: string) => apiFetch<Product>(`/product/products/${id}`),
  create: (data: Partial<Product>) =>
    apiFetch<Product>('/product/products', { method: 'POST', auth: true, body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Product>) =>
    apiFetch<Product>(`/product/products/${id}`, { method: 'PUT', auth: true, body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/product/products/${id}`, { method: 'DELETE', auth: true }),
};

export const contentApi = {
  get: () => apiFetch<SiteContent>('/content/site-content', { allowNotFound: true }),
  update: (data: Partial<SiteContent>) =>
    apiFetch<SiteContent>('/content/site-content', { method: 'PUT', auth: true, body: JSON.stringify(data) }),
};

/* ── Orders ───────────────────────────────────────── */
export interface OrderItem {
  _id: string;
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  product?: Product;
}

export interface Order {
  _id: string;
  id: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: Record<string, unknown> | null;
  notes: string | null;
  order_items: OrderItem[];
  order_status_history?: OrderStatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistoryEntry {
  _id: string;
  id: string;
  order_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  note: string | null;
  created_by_email: string | null;
  created_at: string;
}

export const ordersApi = {
  list: () => apiFetch<Order[]>('/order/orders', { auth: true }),
  track: (orderNumber: string, email: string) =>
    apiFetch<Order | null>(`/order/orders/track?order_number=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`, { allowNotFound: true }),
  create: (data: {
    items: { product_id: string; quantity: number; unit_price: number }[];
    shipping_address: Record<string, unknown>;
    user_id?: string;
    guest_email?: string;
    guest_name?: string;
    notes?: string;
  }) => apiFetch<Order>('/order/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    apiFetch<Order>(`/order/orders/${id}/status`, { method: 'PUT', auth: true, body: JSON.stringify({ status }) }),
};

/* ── Paystack ─────────────────────────────────────── */
export const paystackApi = {
  initialize: (data: { email: string; amount: number; reference?: string; callback_url?: string; metadata?: Record<string, unknown> }) =>
    apiFetch<{ data: { authorization_url: string; reference: string; access_code: string } }>('/paystack/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verify: (reference: string) =>
    apiFetch<{ data: { status: string; amount: number; reference: string } }>(`/paystack/verify/${reference}`),
};
