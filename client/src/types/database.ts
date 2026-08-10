import type { Product, Order, OrderItem, OrderStatusHistoryEntry } from '../lib/api';

export type { Product, Order, OrderItem, OrderStatusHistoryEntry } from '../lib/api';

export type OrderStatus = Order['status'];

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product?: Product })[];
  order_status_history?: OrderStatusHistoryEntry[];
}
