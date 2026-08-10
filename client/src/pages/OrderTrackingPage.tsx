import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ordersApi, productsApi } from '../lib/api';
import { formatPrice } from '../lib/format';
import type { OrderWithItems } from '../types/database';
import { Search, Package, ArrowLeft, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

const LOGO_URL = '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg';

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'] as const;

const STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string; bg: string; border: string }> = {
  pending: { label: 'Order Placed', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const STOCK_PHOTOS = [
  'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=100',
];

export function OrderTrackingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get('order') && searchParams.get('email')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      setError('Please enter both your order number and email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await ordersApi.track(orderNumber.trim(), email.trim());

      if (!data) {
        setOrder(null);
        setError('No order found. Please check your order number and email and try again.');
        return;
      }

      // Fetch product details
      const allProducts = await productsApi.list();
      const productMap = new Map(allProducts.map(p => [p._id, p]));
      const orderWithProducts = {
        ...data,
        order_items: data.order_items.map(item => ({
          ...item,
          product: productMap.get(item.product_id) || undefined,
        })),
      } as unknown as OrderWithItems;
      setOrder(orderWithProducts);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentStatusIndex = order ? STATUS_FLOW.indexOf(order.status as typeof STATUS_FLOW[number]) : -1;

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)'
    }}>
      <header className="bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: 'var(--stone-200)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>

        <h1 className="text-2xl font-light text-stone-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Track Your Order
        </h1>
        <p className="text-stone-500 mb-8">
          Enter your order number and the email you used at checkout to see your order status.
        </p>

        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. NB-1001"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto mt-4 px-6 py-2.5 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
            <p className="text-rose-700">{error}</p>
          </div>
        )}

        {order && !error && (
          <div className="space-y-6">
            {/* Status tracker */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium text-stone-800">Order Status</h2>
                <span className="text-sm text-stone-500">{order.order_number}</span>
              </div>
              <p className="text-sm text-stone-500 mb-6">
                Placed on {formatDate(order.created_at)}
              </p>

              {order.status === 'cancelled' ? (
                <div className={`flex items-center gap-3 p-4 rounded-lg ${STATUS_META.cancelled.bg} ${STATUS_META.cancelled.border} border`}>
                  <XCircle className={`w-6 h-6 ${STATUS_META.cancelled.color}`} />
                  <div>
                    <p className={`font-medium ${STATUS_META.cancelled.color}`}>Order Cancelled</p>
                    <p className="text-sm text-stone-500">This order has been cancelled.</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-200" />
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-emerald-400 transition-all duration-500"
                    style={{ width: `${(currentStatusIndex / (STATUS_FLOW.length - 1)) * 100}%` }}
                  />
                  <div className="relative flex justify-between">
                    {STATUS_FLOW.map((status, idx) => {
                      const meta = STATUS_META[status];
                      const Icon = meta.icon;
                      const isComplete = idx <= currentStatusIndex;
                      const isCurrent = idx === currentStatusIndex;
                      return (
                        <div key={status} className="flex flex-col items-center gap-2 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              isComplete
                                ? 'bg-emerald-400 border-emerald-400 text-white'
                                : 'bg-white border-stone-200 text-stone-400'
                            } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs font-medium text-center ${isComplete ? 'text-stone-800' : 'text-stone-400'}`}>
                            {meta.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Status history timeline */}
            {order.order_status_history && order.order_status_history.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-stone-800 mb-4">Status Updates</h3>
                <div className="space-y-4">
                  {[...order.order_status_history]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((entry) => {
                      const meta = STATUS_META[entry.status];
                      const Icon = meta?.icon || Clock;
                      return (
                        <div key={entry._id} className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${meta?.bg || 'bg-stone-50'}`}>
                            <Icon className={`w-4 h-4 ${meta?.color || 'text-stone-500'}`} />
                          </div>
                          <div className="flex-1 pb-4 border-b border-stone-100 last:border-0">
                            <p className="text-sm font-medium text-stone-800">{meta?.label || entry.status}</p>
                            <p className="text-xs text-stone-500">{formatDateTime(entry.created_at)}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Order items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-stone-800 mb-4">Items in This Order</h3>
              <div className="space-y-3">
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
                    </div>
                    <p className="text-sm font-medium text-stone-800">
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between">
                <span className="text-stone-600">Total</span>
                <span className="text-lg font-semibold text-stone-800">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>

            {/* Shipping address */}
            {order.shipping_address && typeof order.shipping_address === 'object' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-stone-800 mb-3">Shipping Address</h3>
                <div className="text-sm text-stone-600 space-y-0.5">
                  <p>{(order.shipping_address as { fullName?: string }).fullName}</p>
                  <p>{(order.shipping_address as { address?: string }).address}</p>
                  <p>
                    {(order.shipping_address as { city?: string }).city},{' '}
                    {(order.shipping_address as { state?: string }).state}{' '}
                    {(order.shipping_address as { zipCode?: string }).zipCode}
                  </p>
                  <p>{(order.shipping_address as { phone?: string }).phone}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {searched && !order && !error && !loading && (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500">No order found with those details.</p>
          </div>
        )}
      </main>
    </div>
  );
}
