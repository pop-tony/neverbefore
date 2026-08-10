import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi } from '../lib/api';
import { formatPrice } from '../lib/format';
import type { ShippingAddress } from '../types/database';
import { Sparkles, ArrowLeft, CheckCircle, Search } from 'lucide-react';

const STOCK_PHOTOS = [
  'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=100',
];

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'address' | 'review' | 'success'>('address');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [placedOrderEmail, setPlacedOrderEmail] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.full_name || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!user && !email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await ordersApi.create({
        items: items.map((item) => ({
          product_id: item.product._id,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
        shipping_address: address as unknown as Record<string, unknown>,
        user_id: user?.id,
        guest_email: user ? undefined : email.trim(),
        guest_name: user ? undefined : address.fullName,
      });

      setPlacedOrderNumber(order.order_number);
      setPlacedOrderEmail(user?.email || email.trim());
      clearCart();
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)'
      }}>
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h2 className="text-xl font-medium text-stone-700">Your cart is empty</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-rose-500 hover:text-rose-600 font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{
        background: 'linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)'
      }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-light text-stone-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Order Placed Successfully!
          </h1>
          {placedOrderNumber && (
            <p className="text-stone-600 mb-2">
              Your order number is{' '}
              <span className="font-semibold text-stone-800">{placedOrderNumber}</span>
            </p>
          )}
          <p className="text-stone-600 mb-8">
            Thank you for your order. Save your order number and email to track your order anytime.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium tracking-wide shadow-md hover:shadow-lg transition-all"
          >
            Continue Shopping
          </button>
          {placedOrderNumber && placedOrderEmail && (
            <button
              onClick={() => navigate(`/track?order=${placedOrderNumber}&email=${encodeURIComponent(placedOrderEmail)}`)}
              className="flex items-center justify-center gap-2 w-full mt-2 py-2 text-rose-500 hover:text-rose-600 text-sm"
            >
              <Search className="w-4 h-4" />
              Track This Order
            </button>
          )}
          {user && (
            <button
              onClick={() => navigate('/orders')}
              className="block w-full mt-2 py-2 text-stone-500 hover:text-stone-700 text-sm"
            >
              View Order History
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)'
    }}>
      <header className="bg-white/90 backdrop-blur-sm border-b" style={{ borderColor: 'var(--stone-200)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => (step === 'review' ? setStep('address') : navigate(-1))}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <a href="/" className="flex items-center gap-2 min-w-0">
            <img src="/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg" alt="Never Before Cosmetics" className="h-8 w-8 rounded-full object-cover border flex-shrink-0" style={{ borderColor: 'var(--color-gold)' }} />
            <span className="figma-logo-text">
              never before
              <span className="cosmetics-text hidden sm:inline">cosmetics</span>
            </span>
          </a>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {step === 'address' && (
          <div>
            <h2 className="text-2xl font-light text-stone-800 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              Shipping Details
            </h2>

            {!user && (
              <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-sm text-rose-700 mb-2">
                  <span className="font-medium">Guest checkout</span> — no account needed.
                </p>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                    placeholder="you@example.com"
                    required
                  />
                  <p className="text-xs text-stone-500 mt-1.5">
                    We'll use this email so you can track your order later.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleContinueToReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => updateAddress('fullName', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address.address}
                  onChange={(e) => updateAddress('address', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => updateAddress('city', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => updateAddress('state', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={address.zipCode}
                    onChange={(e) => updateAddress('zipCode', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => updateAddress('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium tracking-wide shadow-md hover:shadow-lg hover:from-rose-500 hover:to-amber-500 transition-all mt-6"
              >
                Continue to Review
              </button>
            </form>
          </div>
        )}

        {step === 'review' && (
          <div>
            <h2 className="text-2xl font-light text-stone-800 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              Review Order
            </h2>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-sm font-medium text-stone-800 mb-3">Shipping Address</h3>
              <div className="text-sm text-stone-600 space-y-0.5">
                <p>{address.fullName}</p>
                <p>{address.address}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
                <p>{address.phone}</p>
                {!user && <p className="pt-1 text-stone-500">{email}</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-sm font-medium text-stone-800 mb-4">Order Items</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0">
                      <img
                        src={item.product.image_url || STOCK_PHOTOS[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{item.product.name}</p>
                      <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-stone-800">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-stone-200">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-stone-600 mt-2">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-medium text-stone-800 mt-2">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium tracking-wide shadow-md hover:shadow-lg hover:from-rose-500 hover:to-amber-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
