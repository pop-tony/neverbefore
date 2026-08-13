import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Truck, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function CheckoutModal({ isOpen, onClose, items = [], onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500? 0 : 25;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onSuccess();
    onClose();
  };

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-2xl font-black">
                {items.length === 1? 'Buy Now' : `Checkout (${items.length} items)`}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Items Summary */}
              <div className="mb-6">
                <h3 className="mb-3 font-bold">Your Rituals</h3>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={`${item.id}-${item.size}-${item.color}-${idx}`} className="flex gap-3 text-sm">
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {item.size && `Size: ${item.size} `}{item.color && `Color: ${item.color}`}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">₵{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#C5A059]" />
                  <h3 className="text-lg font-bold">Shipping Details</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    required
                    value={form.city}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    required
                    value={form.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-800 md:col-span-2"
                  />
                  <input
                    type="text"
                    name="region"
                    placeholder="Region"
                    required
                    value={form.region}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#C5A059] dark:border-zinc-700 dark:bg-zinc-800 md:col-span-2"
                  />
                </div>
              </div>

              {/* Payment - Mock */}
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#C5A059]" />
                  <h3 className="text-lg font-bold">Payment</h3>
                </div>
                <div className="rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
                  <Sparkles className="mx-auto mb-2 h-6 w-6 text-[#C5A059]" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Secure payment coming soon. Click "Place Order" to confirm your Never Before Cosmetic rituals.
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                <h3 className="mb-3 font-bold">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                    <span className="font-semibold">₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Shipping</span>
                    <span className="font-semibold">{shipping === 0? 'FREE' : `₵${shipping}`}</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-2 dark:border-zinc-700">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Total</span>
                      <span className="font-black">₵{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isProcessing}
                className="w-full rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E8D5B5] py-4 font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
              >
                {isProcessing? 'Processing...' : `Place Order - ₵${total.toFixed(2)}`}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}