import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi, productsApi, type Order } from '../lib/api';
import { formatPrice } from '../lib/format';
import type { OrderWithItems } from '../types/database';
import { Package, ChevronRight, Sparkles } from 'lucide-react';

const LOGO_URL = '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Processing',
  shipped: 'Shipped',
  delivered: 'Completed',
  cancelled: 'Cancelled',
};

const STOCK_PHOTOS = [
  'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=100',
];

export function OrderHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await ordersApi.list();
      // Fetch product details for each order item
      const allProducts = await productsApi.list();
      const productMap = new Map(allProducts.map(p => [p._id, p]));
      const ordersWithProducts = data.map((o: Order) => ({
        ...o,
        order_items: o.order_items.map(item => ({
          ...item,
          product: productMap.get(item.product_id) || undefined,
        })),
      })) as unknown as OrderWithItems[];
      setOrders(ordersWithProducts);
    } catch {
      // leave empty
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatStatus = (status: string) => {
    return STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)'
      }}>
        <Sparkles className="w-10 h-10 text-rose-300 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)'
      }}>
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h2 className="text-xl font-medium text-stone-700">Sign in to view your orders</h2>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 text-rose-500 hover:text-rose-600 font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)'
    }}>
      <header className="bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: 'var(--stone-200)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={LOGO_URL} alt="Never Before Cosmetics" className="h-9 w-9 rounded-full object-cover border flex-shrink-0" style={{ borderColor: 'var(--color-gold)' }} />
            <span className="figma-logo-text hidden sm:inline">
              never before
              <span className="cosmetics-text">cosmetics</span>
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium flex-shrink-0"
            style={{ color: 'var(--color-gold)' }}
          >
            <span className="hidden sm:inline">Continue Shopping</span>
            <span className="sm:hidden">Store</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-light text-stone-800 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-stone-300 mb-4" />
            <h2 className="text-xl font-medium text-stone-700">No orders yet</h2>
            <p className="text-stone-500 mt-2">Start shopping to see your orders here!</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2.5 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  className="w-full p-4 sm:p-6 flex items-center gap-3 sm:gap-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">
                      Order from {formatDate(order.created_at)}
                    </p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {order.order_items?.length || 0} items - {formatPrice(order.total_amount)}
                    </p>
                    <span className={`sm:hidden inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                      {formatStatus(order.status)}
                    </span>
                    <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${expandedOrder === order._id ? 'rotate-90' : ''}`} />
                  </div>
                  <ChevronRight className={`sm:hidden w-5 h-5 text-stone-400 transition-transform flex-shrink-0 ${expandedOrder === order._id ? 'rotate-90' : ''}`} />
                </button>

                {expandedOrder === order._id && (
                  <div className="px-4 sm:px-6 pb-6 pt-0 border-t border-stone-100">
                    <div className="pt-4 space-y-3">
                      {order.order_items?.map((item) => (
                        <div key={item._id} className="flex gap-4 p-3 bg-stone-50 rounded-lg">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0">
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
                            <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium text-stone-800 mt-1">
                              {formatPrice(item.unit_price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.shipping_address && typeof order.shipping_address === 'object' && (
                      <div className="mt-4 p-3 bg-stone-50 rounded-lg">
                        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">
                          Shipping Address
                        </p>
                        <p className="text-sm text-stone-700">
                          {(order.shipping_address as { fullName?: string; address?: string; city?: string; state?: string; zipCode?: string }).fullName}
                        </p>
                        <p className="text-sm text-stone-600">
                          {(order.shipping_address as { address?: string }).address}
                        </p>
                        <p className="text-sm text-stone-600">
                          {(order.shipping_address as { city?: string; state?: string; zipCode?: string }).city}, {(order.shipping_address as { state?: string }).state} {(order.shipping_address as { zipCode?: string }).zipCode}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
