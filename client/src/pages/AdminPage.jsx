import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminProducts } from "./admin/AdminProducts";
import { AdminOrders } from "./admin/AdminOrders";
import { AdminContent } from "./admin/AdminContent";
import { useSiteContent } from "../lib/siteContent";
function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const { content, loading: contentLoading } = useSiteContent();
  const [currentPage, setCurrentPage] = useState("dashboard");
  if (loading || contentLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-stone-100", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-stone-500", children: "Loading..." })
    ] }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: {
      background: "linear-gradient(135deg, #fff5f7 0%, #fef3e2 50%, #f5f0e8 100%)"
    }, children: /* @__PURE__ */ jsxs("div", { className: "text-center max-w-md p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsx("svg", { className: "w-10 h-10 text-rose-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 15v2m0 0v2m0-2h2m-2 0H8m4-11a3 3 0 00-3 3v1a3 3 0 003 3h0a3 3 0 003-3V7a3 3 0 00-3-3zm6 9a3 3 0 11-6 0 3 3 0 016 0z" }) }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-light text-stone-800 mb-2", style: { fontFamily: "Georgia, serif" }, children: content.admin_access_title }),
      /* @__PURE__ */ jsx("p", { className: "text-stone-600 mb-6", children: content.admin_access_message }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-500", children: content.admin_access_note })
    ] }) });
  }
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return /* @__PURE__ */ jsx(AdminDashboard, {});
      case "products":
        return /* @__PURE__ */ jsx(AdminProducts, {});
      case "orders":
        return /* @__PURE__ */ jsx(AdminOrders, {});
      case "content":
        return /* @__PURE__ */ jsx(AdminContent, {});
      default:
        return /* @__PURE__ */ jsx(AdminDashboard, {});
    }
  };
  return /* @__PURE__ */ jsx(AdminLayout, { currentPage, onNavigate: setCurrentPage, children: renderPage() });
}
export {
  AdminPage
};
