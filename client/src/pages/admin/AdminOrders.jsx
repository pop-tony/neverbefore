import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { ordersApi, productsApi } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { Package, ChevronDown, Mail, User, Search } from "lucide-react";
const STATUS_META = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" },
  confirmed: { label: "Processing", color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200" },
  shipped: { label: "Shipped", color: "text-indigo-700", bg: "bg-indigo-100", border: "border-indigo-200" },
  delivered: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" },
  cancelled: { label: "Cancelled", color: "text-rose-700", bg: "bg-rose-100", border: "border-rose-200" }
};
const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const STOCK_PHOTOS = [
  "https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=100"
];
function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [historyMap, setHistoryMap] = useState({});
  useEffect(() => {
    fetchOrders();
  }, []);
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
      const map = {};
      ordersWithProducts.forEach((o) => {
        if (o.order_status_history) {
          map[o._id] = o.order_status_history;
        }
      });
      setHistoryMap(map);
    } catch {
    }
    setLoading(false);
  };
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await ordersApi.updateStatus(orderId, newStatus);
      setOrders(orders.map(
        (o) => o._id === orderId ? { ...o, status: newStatus } : o
      ));
      if (updated.order_status_history) {
        setHistoryMap({
          ...historyMap,
          [orderId]: updated.order_status_history
        });
      }
    } catch {
    }
  };
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const getCustomerDisplay = (order) => {
    if (order.guest_name) return { name: order.guest_name, email: order.guest_email || "", isGuest: true };
    return { name: "Account Customer", email: "", isGuest: false };
  };
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const customer = getCustomerDisplay(o);
    return o.order_number?.toLowerCase().includes(q) || customer.email.toLowerCase().includes(q) || customer.name.toLowerCase().includes(q);
  });
  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx("p", { className: "text-stone-500", children: "Loading orders..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-light text-stone-800 mb-2", style: { fontFamily: "Georgia, serif" }, children: "Orders" }),
    /* @__PURE__ */ jsx("p", { className: "text-stone-500 mb-6", children: "Click an order to see details and update its status." }),
    /* @__PURE__ */ jsxs("div", { className: "relative mb-4", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          placeholder: "Search by order number, customer name, or email...",
          className: "w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800 text-sm"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-6", children: Object.entries(statusCounts).map(([status, count]) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setStatusFilter(status),
        className: `px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${statusFilter === status ? "bg-rose-500 text-white" : "bg-white text-stone-600 hover:bg-rose-50"}`,
        children: [
          status === "all" ? "All" : STATUS_META[status]?.label || status,
          /* @__PURE__ */ jsxs("span", { className: "ml-1.5 opacity-75", children: [
            "(",
            count,
            ")"
          ] })
        ]
      },
      status
    )) }),
    filteredOrders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-12 text-center", children: [
      /* @__PURE__ */ jsx(Package, { className: "w-12 h-12 mx-auto text-stone-300 mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-stone-500", children: "No orders found" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: filteredOrders.map((order) => {
      const customer = getCustomerDisplay(order);
      const meta = STATUS_META[order.status] || STATUS_META.pending;
      const history = historyMap[order._id] || [];
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white rounded-xl shadow-sm overflow-hidden",
          children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:bg-stone-50 transition-colors",
                onClick: () => setExpandedOrder(expandedOrder === order._id ? null : order._id),
                children: [
                  /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Package, { className: "w-6 h-6 text-rose-400" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-800", children: order.order_number }),
                      /* @__PURE__ */ jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`, children: meta.label }),
                      customer.isGuest && /* @__PURE__ */ jsx("span", { className: "text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500", children: "Guest" })
                    ] }),
                    /* @__PURE__ */ jsxs("p", { className: "text-sm text-stone-500 mt-0.5 truncate", children: [
                      customer.name,
                      " ",
                      customer.email && `\xB7 ${customer.email}`
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 sm:gap-6", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-stone-800", children: formatPrice(order.total_amount) }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500", children: formatDate(order.created_at) })
                    ] }),
                    /* @__PURE__ */ jsx(ChevronDown, { className: `w-5 h-5 text-stone-400 transition-transform ${expandedOrder === order._id ? "rotate-180" : ""}` })
                  ] })
                ]
              }
            ),
            expandedOrder === order._id && /* @__PURE__ */ jsx("div", { className: "px-4 sm:px-6 pb-6 pt-0 border-t border-stone-100", children: /* @__PURE__ */ jsxs("div", { className: "pt-4 sm:pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-stone-800 mb-3", children: "Order Items" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-3", children: order.order_items?.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3 p-3 bg-stone-50 rounded-lg", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0", children: /* @__PURE__ */ jsx(
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
                        item.quantity,
                        " x ",
                        formatPrice(item.unit_price)
                      ] })
                    ] })
                  ] }, item._id)) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-stone-800 mb-3", children: "Customer & Shipping" }),
                  /* @__PURE__ */ jsxs("div", { className: "p-3 bg-stone-50 rounded-lg text-sm text-stone-600 space-y-1", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-stone-700 font-medium", children: [
                      /* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5 text-stone-400" }),
                      customer.name,
                      customer.isGuest && /* @__PURE__ */ jsx("span", { className: "text-xs text-stone-400", children: "(Guest)" })
                    ] }),
                    customer.email && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx(Mail, { className: "w-3.5 h-3.5 text-stone-400" }),
                      customer.email
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "pt-2 border-t border-stone-200", children: order.shipping_address && typeof order.shipping_address === "object" && /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("p", { children: order.shipping_address.fullName }),
                      /* @__PURE__ */ jsx("p", { children: order.shipping_address.address }),
                      /* @__PURE__ */ jsxs("p", { children: [
                        order.shipping_address.city,
                        ",",
                        " ",
                        order.shipping_address.state,
                        " ",
                        order.shipping_address.zipCode
                      ] }),
                      /* @__PURE__ */ jsx("p", { className: "mt-1", children: order.shipping_address.phone })
                    ] }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-stone-800 mb-3", children: "Update Status" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 mb-3", children: "Click a status to update this order. The customer will see the change when they track their order." }),
                  /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: STATUS_ORDER.map((status) => {
                    const m = STATUS_META[status];
                    const isActive = order.status === status;
                    return /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          updateOrderStatus(order._id, status);
                        },
                        disabled: isActive,
                        className: `px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isActive ? `${m.bg} ${m.color} ${m.border} cursor-default` : "border-stone-200 text-stone-600 hover:bg-stone-50"}`,
                        children: m.label
                      },
                      status
                    );
                  }) })
                ] }),
                history.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-stone-800 mb-3", children: "Status History" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [...history].reverse().map((entry, idx) => {
                    const m = STATUS_META[entry.status] || STATUS_META.pending;
                    return /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
                        /* @__PURE__ */ jsx("div", { className: `w-2.5 h-2.5 rounded-full ${m.bg} ${m.color} ring-2 ring-white` }),
                        idx < history.length - 1 && /* @__PURE__ */ jsx("div", { className: "w-0.5 flex-1 bg-stone-200 mt-1" })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex-1 pb-3", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-700", children: m.label }),
                        /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500", children: formatDate(entry.created_at) })
                      ] })
                    ] }, entry._id);
                  }) })
                ] })
              ] })
            ] }) })
          ]
        },
        order._id
      );
    }) })
  ] });
}
export {
  AdminOrders
};
