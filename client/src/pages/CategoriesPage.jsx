import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { productsApi } from "../lib/api";
import { formatPrice } from "../lib/format";
import { useCart } from "../contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import { getCategoryImage, useSiteContent } from "../lib/siteContent";
function CategoriesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const { addToCart } = useCart();
  const { content } = useSiteContent();
  useEffect(() => {
    productsApi.list().then((data) => {
      setProducts(data);
      if (data.length > 0) {
        const categories2 = [...new Set(data.map((p) => p.category).filter(Boolean))];
        if (categories2.length > 0) setActiveCategory(categories2[0]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const filtered = activeCategory ? products.filter((p) => p.category === activeCategory) : products;
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx("p", { className: "text-stone-500", children: "Loading categories..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-light text-stone-800 mb-2", style: { fontFamily: "Georgia, serif" }, children: content.category_heading }),
    /* @__PURE__ */ jsx("p", { className: "text-stone-500 mb-8", children: content.category_subtitle }),
    categories.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-stone-500", children: "No categories available." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mb-8", children: categories.map((cat) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveCategory(cat),
          className: `px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? "text-white shadow-sm" : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"}`,
          style: activeCategory === cat ? { background: "var(--color-pink)" } : void 0,
          children: cat
        },
        cat
      )) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: filtered.map((product) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm overflow-hidden group", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-square overflow-hidden bg-stone-100", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: product.image_url || getCategoryImage(content, product.category || ""),
            alt: product.name,
            className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-400 mb-1", children: product.category }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-stone-800 mb-2 line-clamp-2", children: product.name }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-stone-800", children: formatPrice(product.price) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => addToCart(product),
                className: "w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80",
                style: { background: "var(--color-pink)" },
                children: /* @__PURE__ */ jsx(ShoppingBag, { className: "w-4 h-4 text-white" })
              }
            )
          ] })
        ] })
      ] }, product._id)) })
    ] })
  ] });
}
export {
  CategoriesPage
};
