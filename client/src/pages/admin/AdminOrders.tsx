import { useState, useEffect } from 'react';
import { ordersApi, productsApi, type Order, type Product, type OrderStatusHistoryEntry } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import { Package, ChevronDown, Mail, User, Search } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200' },
  confirmed: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200' },
  shipped: { label: 'Shipped', color: 'text-indigo-700', bg: 'bg-indigo-100', border: 'border-indigo-200' },
  delivered: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200' },
};

const STATUS_ORDER = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STOCK_PHOTOS = [
  'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=100',
];

interface AdminOrder extends Order {
  order_items: (Order['order_items'][0] & { product?: Product })[];
  order_status_history?: OrderStatusHistoryEntry[];
}

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyMap, setHistoryMap] = useState<Record<string, OrderStatusHistoryEntry[]>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersApi.list();
      const allProducts = await productsApi.list();
      const productMap = new Map(allProducts.map(p => [p._id, p]));

      const ordersWithProducts = data.map((o) => ({
        ...o,
        order_items: o.order_items.map((item) => ({
          ...item,
          product: productMap.get(item.product_id) || undefined,
        })),
      })) as unknown as AdminOrder[];

      setOrders(ordersWithProducts);

      // Build history map from embedded order_status_history
      const map: Record<string, OrderStatusHistoryEntry[]> = {};
      ordersWithProducts.forEach((o) => {
        if (o.order_status_history) {
          map[o._id] = o.order_status_history;
        }
      });
      setHistoryMap(map);
    } catch {
      // leave empty
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await ordersApi.updateStatus(orderId, newStatus);
      setOrders(orders.map((o) =>
        o._id === orderId ? { ...o, status: newStatus as AdminOrder['status'] } : o
      ));
      if (updated.order_status_history) {
        setHistoryMap({
          ...historyMap,
          [orderId]: updated.order_status_history,
        });
      }
    } catch {
      // ignore error
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCustomerDisplay = (order: AdminOrder) => {
    if (order.guest_name) return { name: order.guest_name, email: order.guest_email || '', isGuest: true };
    return { name: 'Account Customer', email: '', isGuest: false };
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const customer = getCustomerDisplay(o);
    return (
      o.order_number?.toLowerCase().includes(q) ||
      customer.email.toLowerCase().includes(q) ||
      customer.name.toLowerCase().includes(q)
    );
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-stone-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-light text-stone-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
        Orders
      </h1>
      <p className="text-stone-500 mb-6">Click an order to see details and update its status.</p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order number, customer name, or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
              statusFilter === status
                ? 'bg-rose-500 text-white'
                : 'bg-white text-stone-600 hover:bg-rose-50'
            }`}
          >
            {status === 'all' ? 'All' : STATUS_META[status]?.label || status}
            <span className="ml-1.5 opacity-75">({count})</span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customer = getCustomerDisplay(order);
            const meta = STATUS_META[order.status] || STATUS_META.pending;
            const history = historyMap[order._id] || [];

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:bg-stone-50 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-rose-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-stone-800">
                        {order.order_number}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                        {meta.label}
                      </span>
                      {customer.isGuest && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                          Guest
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-500 mt-0.5 truncate">
                      {customer.name} {customer.email && `· ${customer.email}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-stone-800">
                        {formatPrice(order.total_amount)}
                      </p>
                      <p className="text-xs text-stone-500">{formatDate(order.created_at)}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="px-4 sm:px-6 pb-6 pt-0 border-t border-stone-100">
                    <div className="pt-4 sm:pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-stone-800 mb-3">Order Items</h4>
                          <div className="space-y-3">
                            {order.order_items?.map((item) => (
                              <div key={item._id} className="flex gap-3 p-3 bg-stone-50 rounded-lg">
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0">
                                  <img
                                    src={item.product?.image_url || STOCK_PHOTOS[0]}
                                    alt={item.product?.name || 'Product'}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-stone-800 truncate">
                                    {item.product?.name || 'Product'}
                                  </p>
                                  <p className="text-sm text-stone-500">
                                    Qty: {item.quantity} x {formatPrice(item.unit_price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-stone-800 mb-3">Customer & Shipping</h4>
                          <div className="p-3 bg-stone-50 rounded-lg text-sm text-stone-600 space-y-1">
                            <div className="flex items-center gap-2 text-stone-700 font-medium">
                              <User className="w-3.5 h-3.5 text-stone-400" />
                              {customer.name}
                              {customer.isGuest && <span className="text-xs text-stone-400">(Guest)</span>}
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-stone-400" />
                                {customer.email}
                              </div>
                            )}
                            <div className="pt-2 border-t border-stone-200">
                              {order.shipping_address && typeof order.shipping_address === 'object' && (
                                <>
                                  <p>{(order.shipping_address as { fullName?: string }).fullName}</p>
                                  <p>{(order.shipping_address as { address?: string }).address}</p>
                                  <p>
                                    {(order.shipping_address as { city?: string }).city},{' '}
                                    {(order.shipping_address as { state?: string }).state}{' '}
                                    {(order.shipping_address as { zipCode?: string }).zipCode}
                                  </p>
                                  <p className="mt-1">{(order.shipping_address as { phone?: string }).phone}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-stone-800 mb-3">Update Status</h4>
                          <p className="text-xs text-stone-500 mb-3">
                            Click a status to update this order. The customer will see the change when they track their order.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_ORDER.map((status) => {
                              const m = STATUS_META[status];
                              const isActive = order.status === status;
                              return (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateOrderStatus(order._id, status);
                                  }}
                                  disabled={isActive}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                    isActive
                                      ? `${m.bg} ${m.color} ${m.border} cursor-default`
                                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                                  }`}
                                >
                                  {m.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {history.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-stone-800 mb-3">Status History</h4>
                            <div className="space-y-3">
                              {[...history].reverse().map((entry, idx) => {
                                const m = STATUS_META[entry.status] || STATUS_META.pending;
                                return (
                                  <div key={entry._id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-2.5 h-2.5 rounded-full ${m.bg} ${m.color} ring-2 ring-white`}></div>
                                      {idx < history.length - 1 && <div className="w-0.5 flex-1 bg-stone-200 mt-1"></div>}
                                    </div>
                                    <div className="flex-1 pb-3">
                                      <p className="text-sm font-medium text-stone-700">{m.label}</p>
                                      <p className="text-xs text-stone-500">{formatDate(entry.created_at)}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
