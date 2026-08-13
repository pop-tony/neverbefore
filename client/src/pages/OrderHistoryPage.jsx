import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ordersApi, productsApi } from "../lib/api";
import { formatPrice } from "../lib/format";
import { Package, ChevronRight, Sparkles } from "lucide-react";
const LOGO_URL = "/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg";
const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200"
};
const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Processing",
  shipped: "Shipped",
  delivered: "Completed",
  cancelled: "Cancelled"
};
const STOCK_PHOTOS = [
  "https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=100"
];
function OrderHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
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
      const allProducts = await productsApi.list();
      const productMap = new Map(allProducts.map((p) => [p._id, p]));
      const ordersWithProducts = data.map((o) => ({
        ...o,
        order_items: o.order_items.map((item) => ({
          ...item,
          product: productMap.get(item.product_id) || void 0
        }))
      }));
      setOrders(ordersWithProducts);
    } catch {
    }
    setLoading(false);
  };
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const formatStatus = (status) => {
    return STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: {
      background: "linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)"
    }, children: /* @__PURE__ */ jsx(Sparkles, { className: "w-10 h-10 text-rose-300 animate-pulse" }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: {
      background: "linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)"
    }, children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Package, { className: "w-12 h-12 mx-auto text-stone-300 mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-stone-700", children: "Sign in to view your orders" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/auth"),
          className: "mt-4 text-rose-500 hover:text-rose-600 font-medium",
          children: "Sign In"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: {
    background: "linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)"
  }, children: [
    /* @__PURE__ */ jsx("header", { className: "bg-white/90 backdrop-blur-sm border-b", style: { borderColor: "var(--stone-200)" }, children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
        /* @__PURE__ */ jsx("img", { src: LOGO_URL, alt: "Never Before Cosmetics", className: "h-9 w-9 rounded-full object-cover border flex-shrink-0", style: { borderColor: "var(--color-gold)" } }),
        /* @__PURE__ */ jsxs("span", { className: "figma-logo-text hidden sm:inline", children: [
          "never before",
          /* @__PURE__ */ jsx("span", { className: "cosmetics-text", children: "cosmetics" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/"),
          className: "text-sm font-medium flex-shrink-0",
          style: { color: "var(--color-gold)" },
          children: [
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Continue Shopping" }),
            /* @__PURE__ */ jsx("span", { className: "sm:hidden", children: "Store" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-4xl mx-auto px-4 sm:px-6 py-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-light text-stone-800 mb-8", style: { fontFamily: "Georgia, serif" }, children: "Your Orders" }),
      orders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
        /* @__PURE__ */ jsx(Package, { className: "w-16 h-16 mx-auto text-stone-300 mb-4" }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-stone-700", children: "No orders yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-stone-500 mt-2", children: "Start shopping to see your orders here!" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/"),
            className: "mt-6 px-6 py-2.5 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium",
            children: "Start Shopping"
          }
        )
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: orders.map((order) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white rounded-xl shadow-sm overflow-hidden",
          children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setExpandedOrder(expandedOrder === order._id ? null : order._id),
                className: "w-full p-4 sm:p-6 flex items-center gap-3 sm:gap-4 text-left hover:bg-stone-50 transition-colors",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Package, { className: "w-5 h-5 sm:w-6 sm:h-6 text-rose-400" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-stone-800 truncate", children: [
                      "Order from ",
                      formatDate(order.created_at)
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "text-sm text-stone-500 mt-0.5", children: [
                      order.order_items?.length || 0,
                      " items - ",
                      formatPrice(order.total_amount)
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: `sm:hidden inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`, children: formatStatus(order.status) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex items-center gap-3 flex-shrink-0", children: [
                    /* @__PURE__ */ jsx("span", { className: `text-xs font-medium px-3 py-1 rounded-full border ${STATUS_COLORS[order.status]}`, children: formatStatus(order.status) }),
                    /* @__PURE__ */ jsx(ChevronRight, { className: `w-5 h-5 text-stone-400 transition-transform ${expandedOrder === order._id ? "rotate-90" : ""}` })
                  ] }),
                  /* @__PURE__ */ jsx(ChevronRight, { className: `sm:hidden w-5 h-5 text-stone-400 transition-transform flex-shrink-0 ${expandedOrder === order._id ? "rotate-90" : ""}` })
                ]
              }
            ),
            expandedOrder === order._id && /* @__PURE__ */ jsxs("div", { className: "px-4 sm:px-6 pb-6 pt-0 border-t border-stone-100", children: [
              /* @__PURE__ */ jsx("div", { className: "pt-4 space-y-3", children: order.order_items?.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex gap-4 p-3 bg-stone-50 rounded-lg", children: [
                /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0", children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: item.product?.image_url || STOCK_PHOTOS[0],
                    alt: item.product?.name || "Product",
                    className: "w-full h-full object-cover"
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-800 truncate", children: item.product?.name || "Product" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-sm text-stone-500", children: [
                    "Qty: ",
                    item.quantity
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-800 mt-1", children: formatPrice(item.unit_price) })
                ] })
              ] }, item._id)) }),
              order.shipping_address && typeof order.shipping_address === "object" && /* @__PURE__ */ jsxs("div", { className: "mt-4 p-3 bg-stone-50 rounded-lg", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-stone-500 uppercase tracking-wider mb-2", children: "Shipping Address" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-700", children: order.shipping_address.fullName }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-600", children: order.shipping_address.address }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-stone-600", children: [
                  order.shipping_address.city,
                  ", ",
                  order.shipping_address.state,
                  " ",
                  order.shipping_address.zipCode
                ] })
              ] })
            ] })
          ]
        },
        order.id
      )) })
    ] })
  ] });
}
export {
  OrderHistoryPage
};
