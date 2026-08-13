const API_BASE = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5008/api';
const TOKEN_KEY = 'neverbefore_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const { auth = false, allowNotFound = false, headers = {}, ...rest } = options;
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });

  if (!res.ok) {
    if (allowNotFound && res.status === 404) {
      return null;
    }
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
      if (body.message) message = body.message;
    } catch {
      /* ignore parse error */
    }
    throw new Error(message);
  }

  const body = await res.json();
  if (body && typeof body === 'object') {
    if ('success' in body && 'token' in body && 'user' in body) {
      return body;
    }
    if ('success' in body && 'order' in body) {
      return body.order ?? body;
    }
    if ('success' in body && 'product' in body) {
      return body.product ?? body;
    }
    if ('success' in body && 'products' in body) {
      return body.products;
    }
    if ('success' in body && 'orders' in body) {
      return body.orders;
    }
    if ('success' in body && 'content' in body) {
      return body.content;
    }
    if ('success' in body && 'data' in body) {
      return body.data;
    }
  }
  return body;
}

export const authApi = {
  signup: (email, password, fullName, phone) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, phone, number: phone }),
    }),
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiFetch('/auth/logout', { method: 'POST', auth: true }),
};

export const productsApi = {
  list: () => apiFetch('/product/products'),
  get: (id) => apiFetch(`/product/products/${id}`),
  create: (data) =>
    apiFetch('/product/products', { method: 'POST', auth: true, body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/product/products/${id}`, { method: 'PUT', auth: true, body: JSON.stringify(data) }),
  delete: (id) =>
    apiFetch(`/product/products/${id}`, { method: 'DELETE', auth: true }),
};

export const contentApi = {
  get: () => apiFetch('/content/site-content', { allowNotFound: true }),
  update: (data) =>
    apiFetch('/content/site-content', { method: 'PUT', auth: true, body: JSON.stringify(data) }),
};

export const ordersApi = {
  list: () => apiFetch('/order/orders', { auth: true }),
  track: (orderNumber, email) =>
    apiFetch(`/order/orders/track?order_number=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`, { allowNotFound: true }),
  create: (data) => apiFetch('/order/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) =>
    apiFetch(`/order/orders/${id}/status`, { method: 'PUT', auth: true, body: JSON.stringify({ status }) }),
};

export const paystackApi = {
  initialize: (data) =>
    apiFetch('/paystack/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verify: (reference) =>
    apiFetch(`/paystack/verify/${reference}`),
};