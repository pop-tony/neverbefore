import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X, Settings2 } from "lucide-react";
const LOGO_URL = "/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg";
function AdminLayout({ children, currentPage, onNavigate }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };
  const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: Package },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "content", label: "Site Content", icon: Settings2 }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-stone-100", children: [
    /* @__PURE__ */ jsx("div", { className: "lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-stone-200 z-40", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 h-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("img", { src: LOGO_URL, alt: "Never Before Cosmetics", className: "h-8 w-8 rounded-full object-cover border", style: { borderColor: "var(--color-gold)" } }),
        /* @__PURE__ */ jsxs("span", { className: "figma-logo-text", style: { fontSize: "1.3rem" }, children: [
          "never before",
          /* @__PURE__ */ jsx("span", { className: "cosmetics-text", children: "cosmetics" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSidebarOpen(!sidebarOpen),
          className: "p-2 rounded-lg hover:bg-stone-100",
          children: sidebarOpen ? /* @__PURE__ */ jsx(X, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(Menu, { className: "w-6 h-6" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: `fixed inset-y-0 left-0 w-64 bg-white border-r border-stone-200 z-50 transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`, children: /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
      /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-stone-100", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("img", { src: LOGO_URL, alt: "Never Before Cosmetics", className: "h-10 w-10 rounded-full object-cover border", style: { borderColor: "var(--color-gold)" } }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "figma-logo-text", style: { fontSize: "1.4rem" }, children: [
            "never before",
            /* @__PURE__ */ jsx("span", { className: "cosmetics-text", children: "cosmetics" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500", children: "Admin Panel" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("nav", { className: "flex-1 p-4 space-y-1", children: navItems.map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              onNavigate(item.id);
              setSidebarOpen(false);
            },
            className: `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${currentPage === item.id ? "bg-amber-50 text-amber-700" : "text-stone-600 hover:bg-stone-50"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: item.label })
            ]
          },
          item.id
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-stone-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-800", children: user?.full_name || "Admin" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500", children: user?.email })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleSignOut,
            className: "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-stone-600 hover:bg-amber-50 hover:text-amber-700 transition-colors",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Sign Out" })
            ]
          }
        )
      ] })
    ] }) }),
    sidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/20 z-40 lg:hidden",
        onClick: () => setSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "lg:pl-64 pt-16 lg:pt-0", children: /* @__PURE__ */ jsx("main", { className: "p-4 sm:p-6 lg:p-8", children }) })
  ] });
}
export {
  AdminLayout
};
