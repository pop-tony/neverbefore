import { jsx, jsxs } from "react/jsx-runtime";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Shield, Package, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
function ProfilePage() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  return /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto px-4 sm:px-6 py-12", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "h-28", style: { background: "linear-gradient(135deg, var(--color-pink-light) 0%, var(--color-gold-light) 100%)" } }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 sm:px-8 pb-8 -mt-12", children: [
      /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm mb-4", style: { border: "3px solid var(--color-gold)" }, children: /* @__PURE__ */ jsx(User, { className: "w-10 h-10", style: { color: "var(--color-gold)" } }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-light text-stone-800 mb-1", style: { fontFamily: "Georgia, serif" }, children: user.full_name || "My Account" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-stone-500 mb-6", children: [
        /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: user.email })
      ] }),
      isAdmin && /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6", style: { background: "var(--rose-50)", color: "var(--rose-500)" }, children: [
        /* @__PURE__ */ jsx(Shield, { className: "w-3.5 h-3.5" }),
        "Administrator"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/orders",
            className: "flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors",
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center", style: { background: "var(--rose-50)" }, children: /* @__PURE__ */ jsx(Package, { className: "w-5 h-5", style: { color: "var(--rose-400)" } }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-800", children: "Transaction History" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500", children: "View your past orders" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleSignOut,
            className: "flex items-center gap-3 w-full p-4 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors",
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center", style: { background: "var(--rose-50)" }, children: /* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5", style: { color: "var(--rose-400)" } }) }),
              /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-800", children: "Sign Out" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500", children: "Log out of your account" })
              ] })
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  ProfilePage
};
