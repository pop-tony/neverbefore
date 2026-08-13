import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { ordersApi } from "../lib/api";
import { formatPrice } from "../lib/format";
import { Sparkles, ArrowLeft, CheckCircle, Search } from "lucide-react";
const STOCK_PHOTOS = [
  "https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=100"
];
function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("address");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState(null);
  const [placedOrderEmail, setPlacedOrderEmail] = useState(null);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState({
    fullName: user?.full_name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: ""
  });
  const updateAddress = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };
  const handleContinueToReview = (e) => {
    e.preventDefault();
    setStep("review");
  };
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }
    if (!user && !email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const order = await ordersApi.create({
        items: items.map((item) => ({
          product_id: item.product._id,
          quantity: item.quantity,
          unit_price: item.product.price
        })),
        shipping_address: address,
        user_id: user?.id,
        guest_email: user ? void 0 : email.trim(),
        guest_name: user ? void 0 : address.fullName
      });
      setPlacedOrderNumber(order.order_number);
      setPlacedOrderEmail(user?.email || email.trim());
      clearCart();
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };
  if (items.length === 0 && step !== "success") {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: {
      background: "linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)"
    }, children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "w-12 h-12 mx-auto text-stone-300 mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-stone-700", children: "Your cart is empty" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/"),
          className: "mt-4 text-rose-500 hover:text-rose-600 font-medium",
          children: "Continue Shopping"
        }
      )
    ] }) });
  }
  if (step === "success") {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center px-4", style: {
      background: "linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)"
    }, children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-md", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-10 h-10 text-emerald-600" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-light text-stone-800 mb-2", style: { fontFamily: "Georgia, serif" }, children: "Order Placed Successfully!" }),
      placedOrderNumber && /* @__PURE__ */ jsxs("p", { className: "text-stone-600 mb-2", children: [
        "Your order number is",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-stone-800", children: placedOrderNumber })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-stone-600 mb-8", children: "Thank you for your order. Save your order number and email to track your order anytime." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/"),
          className: "w-full py-3 px-4 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium tracking-wide shadow-md hover:shadow-lg transition-all",
          children: "Continue Shopping"
        }
      ),
      placedOrderNumber && placedOrderEmail && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate(`/track?order=${placedOrderNumber}&email=${encodeURIComponent(placedOrderEmail)}`),
          className: "flex items-center justify-center gap-2 w-full mt-2 py-2 text-rose-500 hover:text-rose-600 text-sm",
          children: [
            /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" }),
            "Track This Order"
          ]
        }
      ),
      user && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/orders"),
          className: "block w-full mt-2 py-2 text-stone-500 hover:text-stone-700 text-sm",
          children: "View Order History"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: {
    background: "linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)"
  }, children: [
    /* @__PURE__ */ jsx("header", { className: "bg-white/90 backdrop-blur-sm border-b", style: { borderColor: "var(--stone-200)" }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => step === "review" ? setStep("address") : navigate(-1),
          className: "flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Back" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("a", { href: "/", className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsx("img", { src: "/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg", alt: "Never Before Cosmetics", className: "h-8 w-8 rounded-full object-cover border flex-shrink-0", style: { borderColor: "var(--color-gold)" } }),
        /* @__PURE__ */ jsxs("span", { className: "figma-logo-text", children: [
          "never before",
          /* @__PURE__ */ jsx("span", { className: "cosmetics-text hidden sm:inline", children: "cosmetics" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-20" })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-3xl mx-auto px-4 sm:px-6 py-8", children: [
      error && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 rounded-lg bg-rose-50 text-rose-700 border border-rose-200", children: error }),
      step === "address" && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-light text-stone-800 mb-6", style: { fontFamily: "Georgia, serif" }, children: "Shipping Details" }),
        !user && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-rose-700 mb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Guest checkout" }),
            " \u2014 no account needed."
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Email Address *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
                placeholder: "you@example.com",
                required: true
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 mt-1.5", children: "We'll use this email so you can track your order later." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleContinueToReview, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Full Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: address.fullName,
                onChange: (e) => updateAddress("fullName", e.target.value),
                className: "w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Street Address" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: address.address,
                onChange: (e) => updateAddress("address", e.target.value),
                className: "w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "City" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: address.city,
                  onChange: (e) => updateAddress("city", e.target.value),
                  className: "w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "State" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: address.state,
                  onChange: (e) => updateAddress("state", e.target.value),
                  className: "w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "ZIP Code" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: address.zipCode,
                  onChange: (e) => updateAddress("zipCode", e.target.value),
                  className: "w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Phone" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "tel",
                  value: address.phone,
                  onChange: (e) => updateAddress("phone", e.target.value),
                  className: "w-full px-4 py-3 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "w-full py-3 px-4 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium tracking-wide shadow-md hover:shadow-lg hover:from-rose-500 hover:to-amber-500 transition-all mt-6",
              children: "Continue to Review"
            }
          )
        ] })
      ] }),
      step === "review" && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-light text-stone-800 mb-6", style: { fontFamily: "Georgia, serif" }, children: "Review Order" }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-stone-800 mb-3", children: "Shipping Address" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-stone-600 space-y-0.5", children: [
            /* @__PURE__ */ jsx("p", { children: address.fullName }),
            /* @__PURE__ */ jsx("p", { children: address.address }),
            /* @__PURE__ */ jsxs("p", { children: [
              address.city,
              ", ",
              address.state,
              " ",
              address.zipCode
            ] }),
            /* @__PURE__ */ jsx("p", { children: address.phone }),
            !user && /* @__PURE__ */ jsx("p", { className: "pt-1 text-stone-500", children: email })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm p-6 mb-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-stone-800 mb-4", children: "Order Items" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: items.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: item.product.image_url || STOCK_PHOTOS[0],
                alt: item.product.name,
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-800 truncate", children: item.product.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-stone-500", children: [
                "Qty: ",
                item.quantity
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-800", children: formatPrice(item.product.price * item.quantity) })
          ] }, item.product.id)) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-stone-200", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-stone-600", children: [
              /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
              /* @__PURE__ */ jsx("span", { children: formatPrice(totalPrice) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-stone-600 mt-2", children: [
              /* @__PURE__ */ jsx("span", { children: "Shipping" }),
              /* @__PURE__ */ jsx("span", { children: "Free" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-lg font-medium text-stone-800 mt-2", children: [
              /* @__PURE__ */ jsx("span", { children: "Total" }),
              /* @__PURE__ */ jsx("span", { children: formatPrice(totalPrice) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handlePlaceOrder,
            disabled: loading,
            className: "w-full py-3 px-4 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium tracking-wide shadow-md hover:shadow-lg hover:from-rose-500 hover:to-amber-500 transition-all disabled:opacity-50",
            children: loading ? "Placing Order..." : "Place Order"
          }
        )
      ] })
    ] })
  ] });
}
export {
  CheckoutPage
};
