import React from 'react'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useOrderContext } from '../context/OrderContext';

export default function Cart() {
  const navigate = useNavigate();
  const { addOrderData } = useOrderContext();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
    clearCart
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [orderRef, setOrderRef] = useState('');
  const [checkoutItems, setCheckoutItems] = useState([]);

  const handleQuantityChange = (cartItemId, change) => {
    const item = cartItems.find(i => i.cartItemId === cartItemId);
    if (item) {
      const newQty = item.quantity + change;
      if (newQty < 1) {
        removeFromCart(cartItemId);
      } else {
        updateQuantity(cartItemId, newQty);
      }
    }
  };

  const handleSingleCheckout = (item) => {
    setCheckoutItems([item]);
    setCheckoutStep('checkout');
  };

  const handleCheckoutAll = () => {
    if (cartItems.length === 0) return;
    setCheckoutItems(cartItems);
    setCheckoutStep('checkout');
  };

  const key = import.meta.env.VITE_PAYSTACK_LIVE_PUBLIC_KEY;
  const backendUrl = import.meta.env.VITE_ENV === "development"? import.meta.env.VITE_BACKEND_URL : "/api";

  const payWithPaystack = () => {
    if (!customerInfo.name ||!customerInfo.email ||!customerInfo.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    if (typeof window.PaystackPop === 'undefined') {
      toast.error('Payment service not loaded. Please refresh.');
      return;
    }

    if (!checkoutItems.length) {
      toast.error('No items selected for checkout');
      return;
    }

    const total = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handlePaymentSuccess = async (response) => {
      try {
        const placeOrder = await createOrder(response.reference, checkoutItems, total);
        if(placeOrder){
          toast.success(`Payment complete! Ref: ${response.reference}`);
          setOrderRef(response.reference);
          setCheckoutStep('success');
        }else{
          toast.error('Payment succeeded but order save failed');
        }
      } catch (err) {
        toast.error('Payment succeeded but order save failed');
        console.error(err);
      }
    };

    const handlePaymentClose = () => {
      toast.info('Payment window closed');
    };

    const handler = window.PaystackPop.setup({
      key: key,
      email: customerInfo.email,
      amount: Math.round(total * 100),
      currency: 'GHS',
      ref: `NBC_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: customerInfo.name },
          { display_name: "Items", variable_name: "items", value: checkoutItems.map(i => `${i.name} x${i.quantity}`).join(', ') },
          { display_name: "Total", variable_name: "total", value: total.toString() }
        ]
      },
      callback: (response) => handlePaymentSuccess(response),
      onClose: handlePaymentClose,
    });

    handler.openIframe();
  };

  const createOrder = async (reference, items, total) => {
    const orderData = {
      customer: customerInfo,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image
      })),
      total,
      paymentRef: reference,
      status: 'paid',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post(`${backendUrl}/order/orders`, { ...orderData }, { withCredentials: true });

      if (res.data.success) {
        toast.success("Order placed successfully!");
        addOrderData(res.data.data);
        items.forEach(item => removeFromCart(item.cartItemId));
        return true;
      } else {
        throw new Error(res.data.message || 'Server rejected order');
      }
    } catch (error) {
      console.error('API failed, saving order locally:', error);
      const localOrder = {
       ...orderData,
        status: 'pending_sync',
        syncError: error.message
      };
      addOrderData(localOrder);
      items.forEach(item => removeFromCart(item.cartItemId));
      toast.warning("Order saved locally", {
        description: `We'll sync when online. Ref: ${reference}`
      });
      return false;
    }
  };

  const currentTotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="min-h-screen bg-white px-4 py-24 text-zinc-900 dark:bg-black dark:text-white"
      >
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between border-b border-zinc-200 p-6 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              {checkoutStep!== 'cart' && checkoutStep!== 'success' && (
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <ShoppingBag className="h-6 w-6 text-zinc-900 dark:text-white" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {checkoutStep === 'cart' && `Bag (${cartCount})`}
                {checkoutStep === 'checkout' && (checkoutItems.length === 1? 'Buy Now' : `Checkout (${checkoutItems.length})`)}
                {checkoutStep === 'success' && 'Order Confirmed'}
              </h2>
            </div>
          </div>

          {checkoutStep === 'cart' && (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0? (
                  <div className="flex h-full flex-col items-center justify-center text-center py-20">
                    <ShoppingBag className="h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                    <p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                      Your bag is empty
                    </p>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Add some Never Before Cosmetic rituals to get started
                    </p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="mt-6 rounded-full bg-black px-8 py-3 font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.cartItemId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div className="flex gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-24 w-24 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-zinc-900 dark:text-white">
                                  {item.name}
                                </h3>
                                <div className="mt-1 flex gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                                  {item.size && <span>Size: {item.size}</span>}
                                  {item.color && (
                                    <span className="flex items-center gap-1">
                                      Color:
                                      <span
                                        className="h-3 w-3 rounded-full border border-zinc-300"
                                        style={{ backgroundColor: item.color }}
                                      />
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 font-bold text-zinc-900 dark:text-white">₵{item.price}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.cartItemId)}
                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.cartItemId, -1)}
                                className="rounded-lg bg-zinc-200 p-1.5 text-zinc-900 hover:bg-zinc-300 active:scale-95 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center font-semibold text-zinc-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.cartItemId, 1)}
                                className="rounded-lg bg-zinc-200 p-1.5 text-zinc-900 hover:bg-zinc-300 active:scale-95 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              <span className="ml-auto font-bold text-zinc-900 dark:text-white">
                                ₵{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSingleCheckout(item)}
                          className="cursor-pointer mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#C5A059] py-2.5 text-sm font-semibold text-[#C5A059] transition hover:bg-[#C5A059] hover:text-white active:scale-95"
                        >
                          Buy Now ₵{(item.price * item.quantity).toFixed(2)}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-zinc-900 dark:text-white">
                    <span className="text-lg font-semibold">Subtotal</span>
                    <span className="text-2xl font-bold">₵{cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    Shipping calculated at checkout
                  </p>
                  <button
                    type="button"
                    onClick={handleCheckoutAll}
                    className="cursor-pointer mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black py-4 font-semibold text-white transition hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    <CreditCard className="h-5 w-5" />
                    Checkout All Items
                  </button>
                </div>
              )}
            </>
          )}

          {checkoutStep === 'checkout' && (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                <form className="space-y-4">
                  <div className="rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/10 p-4 dark:border-[#C5A059]/20 dark:bg-[#C5A059]/10">
                    <p className="text-sm font-semibold text-[#C5A059] dark:text-[#E8D5B5]">
                      {checkoutItems.length === 1? checkoutItems[0].name : `${checkoutItems.length} items`}
                    </p>
                    {checkoutItems.length === 1 && checkoutItems[0].size && (
                      <div className="mt-1 flex gap-3 text-xs text-[#C5A059]/80 dark:text-[#E8D5B5]/80">
                        <span>Size: {checkoutItems[0].size}</span>
                        <span>Qty: {checkoutItems[0].quantity}</span>
                      </div>
                    )}
                    <p className="mt-2 text-lg font-bold text-[#C5A059] dark:text-[#E8D5B5]">
                      Total: ₵{currentTotal.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                      placeholder="+233..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Delivery Address
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                      placeholder="Enter delivery address"
                    />
                  </div>
                </form>
              </div>

              <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={payWithPaystack}
                  className="w-full rounded-full bg-black py-4 font-semibold text-white transition hover:bg-neutral-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  Pay ₵{currentTotal.toFixed(2)} with Paystack
                </button>
              </div>
            </>
          )}

          {checkoutStep === 'success' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex h-full flex-col items-center justify-center text-center py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10"
                >
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </motion.div>

                <h3 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
                  Order Confirmed!
                </h3>
                <p className="mt-2 text-balance text-sm text-zinc-600 dark:text-zinc-400">
                  Order ref: <span className="font-semibold text-zinc-900 dark:text-white">{orderRef}</span>
                </p>
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  We've sent confirmation to <span className="font-semibold text-zinc-900 dark:text-white">{customerInfo.email}</span>
                </p>

                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="mt-8 w-full rounded-full border-2 border-black py-4 font-semibold text-black transition hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
