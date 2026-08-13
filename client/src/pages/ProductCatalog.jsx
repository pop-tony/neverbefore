import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useMemo } from "react";
import { productsApi } from "../lib/api";
import { formatPrice } from "../lib/format";
import { useCart } from "../contexts/CartContext";
import { ShoppingBag, Plus, Minus, Sparkles, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { getCategoryImage, useSiteContent } from "../lib/siteContent";
const DEFAULT_FALLBACK_IMAGE = "/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg";
function HeroCarousel({ content }) {
  const [slide, setSlide] = useState(0);
  const slides = content.hero_images.length > 0 ? content.hero_images : [content.logo_url];
  const next = useCallback(() => setSlide((s) => (s + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setSlide((s) => (s - 1 + slides.length) % slides.length), [slides.length]);
  useEffect(() => {
    const id = setInterval(next, 5e3);
    return () => clearInterval(id);
  }, [next]);
  return /* @__PURE__ */ jsx("div", { className: "relative w-full overflow-hidden", style: { backgroundColor: "var(--color-pink-bg)" }, children: /* @__PURE__ */ jsxs("div", { className: "relative flex items-center min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col justify-center gap-1 overflow-hidden opacity-40 pointer-events-none", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "discount-repeat-text", children: "DISCOUNT\xA0DISCOUNT\xA0DISCOUNT\xA0DISCOUNT\xA0DISCOUNT\xA0DISCOUNT\xA0DISCOUNT\xA0DISCOUNT" }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex-1 px-6 sm:px-12 lg:px-16 py-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs sm:text-sm font-medium text-white/80 tracking-widest uppercase mb-2", style: { fontFamily: "var(--font-body)" }, children: content.hero_badge }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-4xl lg:text-5xl font-normal text-white max-w-md leading-tight", style: { fontFamily: "var(--font-display)" }, children: content.hero_title }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm sm:text-base text-white/80 max-w-sm", style: { fontFamily: "var(--font-body)" }, children: content.hero_subtitle }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: content.hero_cta_href,
          className: "inline-block mt-5 px-6 py-2.5 rounded-full text-sm font-medium text-white border border-white/60 hover:bg-white/10 transition-colors",
          style: { fontFamily: "var(--font-body)" },
          children: content.hero_cta_label
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 hidden sm:block w-[40%] lg:w-[35%] h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: slides[slide],
          alt: "Featured product",
          className: "absolute inset-0 w-full h-full object-cover"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-transparent to-transparent", style: { background: "linear-gradient(to right, var(--color-pink-bg) 0%, transparent 30%)" } })
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: prev, className: "absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors", "aria-label": "Previous slide", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5 text-white" }) }),
    /* @__PURE__ */ jsx("button", { onClick: next, className: "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors", "aria-label": "Next slide", children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-white" }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2", children: slides.map((_, i) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setSlide(i),
        className: `carousel-dot ${i === slide ? "active" : ""}`,
        "aria-label": `Go to slide ${i + 1}`
      },
      i
    )) })
  ] }) });
}
function CategoryRow({ categories, selected, onSelect, content }) {
  const displayCats = categories.length > 0 ? categories : content.categories.map((category) => category.name).filter(Boolean);
  return /* @__PURE__ */ jsxs("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-xl sm:text-2xl font-normal text-[#1a1d20] mb-2", style: { fontFamily: "var(--font-display)" }, children: content.category_heading }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-500 mb-5", children: content.category_subtitle }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-3 sm:gap-5 overflow-x-auto pb-2 -mx-1 px-1", children: displayCats.map((cat) => {
      const img = getCategoryImage(content, cat);
      const isActive = selected === cat;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onSelect(isActive ? null : cat),
          className: `flex-shrink-0 flex flex-col items-center gap-2 group transition-transform ${isActive ? "scale-95" : "hover:scale-105"}`,
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden border-2 transition-colors",
                style: { borderColor: isActive ? "var(--color-gold)" : "transparent" },
                children: /* @__PURE__ */ jsx("img", { src: img, alt: cat, className: "w-full h-full object-cover" })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: `text-xs sm:text-sm font-medium ${isActive ? "" : "text-[#1a1d20]"} text-center`, style: isActive ? { color: "var(--color-gold)" } : void 0, children: cat })
          ]
        },
        cat
      );
    }) })
  ] });
}
function ProductCard({ product, onAddToCart, fallbackImage }) {
  const [quantity, setQuantity] = useState(1);
  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };
  const displayImage = product.image_url || fallbackImage;
  return /* @__PURE__ */ jsxs("div", { className: "group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300", children: [
    /* @__PURE__ */ jsx("div", { className: "aspect-square overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: displayImage,
        alt: product.name,
        className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      product.category && /* @__PURE__ */ jsx("span", { className: "text-xs font-medium uppercase tracking-wider", style: { color: "var(--color-gold)" }, children: product.category }),
      /* @__PURE__ */ jsx("h3", { className: "text-stone-800 font-medium mt-1 truncate", children: product.name }),
      product.description && /* @__PURE__ */ jsx("p", { className: "text-stone-500 text-sm mt-1 line-clamp-2", children: product.description }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-stone-800", children: formatPrice(product.price) }),
        product.stock_quantity > 0 ? /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full", children: "In Stock" }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full", children: "Out of Stock" })
      ] }),
      product.stock_quantity > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setQuantity(Math.max(1, quantity - 1)),
            className: "w-9 h-9 flex items-center justify-center rounded-full border text-stone-600 hover:bg-stone-50 transition-colors",
            style: { borderColor: "var(--stone-200)" },
            children: /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "w-8 text-center text-sm font-medium text-stone-700", children: quantity }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setQuantity(Math.min(product.stock_quantity, quantity + 1)),
            className: "w-9 h-9 flex items-center justify-center rounded-full border text-stone-600 hover:bg-stone-50 transition-colors",
            style: { borderColor: "var(--stone-200)" },
            children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleAddToCart,
            className: "ml-auto flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all",
            style: { background: "linear-gradient(to right, var(--color-pink), var(--color-gold-light))" },
            children: [
              /* @__PURE__ */ jsx(ShoppingBag, { className: "w-3.5 h-3.5" }),
              "Add"
            ]
          }
        )
      ] })
    ] })
  ] });
}
function CartSidebar({ isOpen, onClose, onCheckout }) {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/20 z-40", onClick: onClose }),
    /* @__PURE__ */ jsxs("div", { className: "fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6 border-b flex items-center justify-between", style: { borderColor: "var(--stone-200)" }, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-stone-800", children: "Your Cart" }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-stone-400 hover:text-stone-600 text-2xl", children: "\xD7" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-6", children: items.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx(ShoppingBag, { className: "w-12 h-12 mx-auto text-stone-300 mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-stone-500", children: "Your cart is empty" })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: items.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex gap-4 p-4 bg-stone-50 rounded-lg", children: [
        /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0", children: /* @__PURE__ */ jsx("img", { src: item.product.image_url || DEFAULT_FALLBACK_IMAGE, alt: item.product.name, className: "w-full h-full object-cover" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-stone-800 truncate", children: item.product.name }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-500 mt-0.5", children: formatPrice(item.product.price) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => updateQuantity(item.product.id, item.quantity - 1),
                className: "w-9 h-9 flex items-center justify-center rounded-lg border text-stone-600 hover:bg-stone-100 transition-colors",
                style: { borderColor: "var(--stone-200)" },
                children: /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-stone-700 w-8 text-center font-medium", children: item.quantity }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => updateQuantity(item.product.id, item.quantity + 1),
                className: "w-9 h-9 flex items-center justify-center rounded-lg border text-stone-600 hover:bg-stone-100 transition-colors",
                style: { borderColor: "var(--stone-200)" },
                children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: () => removeFromCart(item.product.id), className: "ml-auto text-xs text-rose-500 hover:text-rose-600 px-2 py-2", children: "Remove" })
          ] })
        ] })
      ] }, item.product.id)) }) }),
      items.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-6 border-t bg-stone-50", style: { borderColor: "var(--stone-200)" }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-stone-600", children: "Subtotal" }),
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-stone-800", children: formatPrice(totalPrice) })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onCheckout,
            className: "w-full py-3 px-4 rounded-lg text-white font-medium tracking-wide shadow-md hover:shadow-lg transition-all",
            style: { background: "linear-gradient(to right, var(--color-pink), var(--color-gold-light))" },
            children: "Proceed to Checkout"
          }
        ),
        /* @__PURE__ */ jsx("button", { onClick: clearCart, className: "w-full mt-2 py-2 text-sm text-stone-500 hover:text-stone-700", children: "Clear Cart" })
      ] })
    ] })
  ] });
}
function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();
  const { content, loading: contentLoading } = useSiteContent();
  useEffect(() => {
    fetchProducts();
  }, []);
  const fetchProducts = async () => {
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch {
    }
    setLoading(false);
  };
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const handleAddToCart = (product, quantity) => {
    addToCart(product, quantity);
  };
  const fallbackImage = useMemo(() => content.hero_images[0] || content.logo_url, [content.hero_images, content.logo_url]);
  if (loading || contentLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", style: { backgroundColor: "var(--color-off-white)" }, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "w-10 h-10 animate-pulse", style: { color: "var(--color-gold)" } }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-stone-500", children: "Loading products..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(HeroCarousel, { content }),
    /* @__PURE__ */ jsx(CategoryRow, { categories, selected: selectedCategory, onSelect: setSelectedCategory, content }),
    /* @__PURE__ */ jsxs("main", { id: "shop", className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12", children: [
      /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl sm:text-2xl font-normal text-[#1a1d20]", style: { fontFamily: "var(--font-display)" }, children: selectedCategory ? selectedCategory : content.shop_heading }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-stone-500 mt-1", children: [
          content.shop_subheading,
          " \xB7 ",
          filteredProducts.length,
          " ",
          filteredProducts.length === 1 ? "product" : "products"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 mb-8", children: [
        /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 px-4 py-2.5 rounded-full border bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors whitespace-nowrap", style: { borderColor: "var(--stone-200)" }, children: [
          /* @__PURE__ */ jsx(SlidersHorizontal, { className: "w-4 h-4" }),
          "Filter"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Search products...",
              className: "w-full px-4 py-2.5 pr-28 rounded-full border bg-white outline-none transition-all text-stone-800 placeholder-stone-400",
              style: { borderColor: "var(--stone-200)" }
            }
          ),
          /* @__PURE__ */ jsx("button", { className: "absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-white text-sm font-medium shadow-sm", style: { background: "var(--color-pink)" }, children: /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 overflow-x-auto pb-3 mb-6 -mx-1 px-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSelectedCategory(null),
            className: `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!selectedCategory ? "text-white" : "bg-white text-stone-600 hover:bg-stone-50"}`,
            style: !selectedCategory ? { background: "var(--color-pink)" } : { border: "1px solid var(--stone-200)" },
            children: "All"
          }
        ),
        categories.map((category) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSelectedCategory(category),
            className: `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category ? "text-white" : "bg-white text-stone-600 hover:bg-stone-50"}`,
            style: selectedCategory === category ? { background: "var(--color-pink)" } : { border: "1px solid var(--stone-200)" },
            children: category
          },
          category
        ))
      ] }),
      products.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "w-16 h-16 mx-auto text-stone-300 mb-4" }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-stone-700", children: content.empty_title }),
        /* @__PURE__ */ jsx("p", { className: "text-stone-500 mt-2", children: content.empty_message })
      ] }) : filteredProducts.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-16", children: /* @__PURE__ */ jsx("p", { className: "text-stone-500", children: "No products matching your search." }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6", children: filteredProducts.map((product) => /* @__PURE__ */ jsx(ProductCard, { product, onAddToCart: handleAddToCart, fallbackImage }, product._id)) })
    ] }),
    /* @__PURE__ */ jsx("footer", { id: "contact", className: "border-t mt-8", style: { borderColor: "var(--stone-200)", backgroundColor: "var(--color-off-white)" }, children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("img", { src: content.logo_url, alt: content.brand_name, className: "w-10 h-10 rounded-full object-cover border", style: { borderColor: "var(--color-gold)" } }),
        /* @__PURE__ */ jsx("span", { className: "figma-logo-text", children: content.brand_name })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-500", style: { fontFamily: "var(--font-body)" }, children: content.footer_note }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-stone-400 text-center sm:text-right space-y-1", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "\xA9 ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " ",
          content.copyright_prefix
        ] }),
        (content.support_email || content.support_phone) && /* @__PURE__ */ jsxs("p", { children: [
          content.support_email && /* @__PURE__ */ jsx("span", { children: content.support_email }),
          content.support_email && content.support_phone && /* @__PURE__ */ jsx("span", { children: " \xB7 " }),
          content.support_phone && /* @__PURE__ */ jsx("span", { children: content.support_phone })
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  CartSidebar,
  ProductCatalog
};
