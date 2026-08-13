import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { productsApi } from "../../lib/api";
import { fileToDataUrl } from "../../lib/fileUploads";
import { formatPrice } from "../../lib/format";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
const STOCK_PHOTOS = [
  "https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/2533486/pexels-photo-2533486.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/3685563/pexels-photo-3685563.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/3685565/pexels-photo-3685565.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/4041152/pexels-photo-4041152.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/7055860/pexels-photo-7055860.jpeg?auto=compress&cs=tinysrgb&w=400"
];
const emptyForm = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category: "",
  stock_quantity: "0"
};
const CATEGORIES = [
  "Lipstick",
  "Foundation",
  "Mascara",
  "Eyeshadow",
  "Blush",
  "Skincare",
  "Fragrance",
  "Nail Care",
  "Tools"
];
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
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
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ ...emptyForm });
    setError(null);
    setShowModal(true);
  };
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      category: product.category || "",
      stock_quantity: product.stock_quantity.toString()
    });
    setError(null);
    setShowModal(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      image_url: formData.image_url || null,
      category: formData.category || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0
    };
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct._id, productData);
      } else {
        await productsApi.create(productData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };
  const handleImageSelect = async (file) => {
    if (!file) return;
    try {
      const imageDataUrl = await fileToDataUrl(file);
      setFormData((current) => ({ ...current, image_url: imageDataUrl }));
    } catch {
      setError("Failed to read selected image");
    }
  };
  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsApi.delete(productId);
      setProducts(products.filter((p) => p._id !== productId));
    } catch {
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx("p", { className: "text-stone-500", children: "Loading products..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-light text-stone-800", style: { fontFamily: "Georgia, serif" }, children: "Products" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: openAddModal,
          className: "flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium shadow-md hover:shadow-lg transition-all",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-5 h-5" }),
            "Add Product"
          ]
        }
      )
    ] }),
    products.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-12 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-stone-500 mb-4", children: "No products yet. Add your first product!" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: openAddModal,
          className: "text-rose-500 hover:text-rose-600 font-medium",
          children: "Add Product"
        }
      )
    ] }) : /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-sm overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-stone-50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider", children: "Product" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider", children: "Category" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider", children: "Price" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider", children: "Stock" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-stone-100", children: products.map((product) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-stone-50", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: product.image_url || STOCK_PHOTOS[0],
              alt: product.name,
              className: "w-full h-full object-cover"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-stone-800 truncate", children: product.name }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-stone-500 truncate max-w-xs", children: product.description })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-stone-600", children: product.category || "-" }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-800", children: formatPrice(product.price) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `text-sm font-medium ${product.stock_quantity === 0 ? "text-rose-600" : product.stock_quantity < 10 ? "text-amber-600" : "text-emerald-600"}`, children: product.stock_quantity }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => openEditModal(product),
              className: "p-2 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-rose-600 transition-colors",
              children: /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDelete(product._id),
              className: "p-2 rounded-lg hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors",
              children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }) })
      ] }, product._id)) })
    ] }) }) }),
    showModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-stone-200 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-stone-800", children: editingProduct ? "Edit Product" : "Add Product" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowModal(false),
            className: "p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600",
            children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [
        error && /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-200", children: error }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Product Name *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: formData.name,
              onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              className: "w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: formData.description,
              onChange: (e) => setFormData({ ...formData, description: e.target.value }),
              className: "w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800 resize-none",
              rows: 3
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Price *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: formData.price,
                onChange: (e) => setFormData({ ...formData, price: e.target.value }),
                className: "w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Stock Quantity *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0",
                value: formData.stock_quantity,
                onChange: (e) => setFormData({ ...formData, stock_quantity: e.target.value }),
                className: "w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Category" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: formData.category,
              onChange: (e) => setFormData({ ...formData, category: e.target.value }),
              className: "w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select category" }),
                CATEGORIES.map((cat) => /* @__PURE__ */ jsx("option", { value: cat, children: cat }, cat))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Product Image" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              onChange: (e) => handleImageSelect(e.target.files?.[0] || null),
              className: "w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
            }
          ),
          formData.image_url && /* @__PURE__ */ jsx("div", { className: "mt-2 w-20 h-20 rounded-lg overflow-hidden bg-stone-100", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: formData.image_url,
              alt: "Preview",
              className: "w-full h-full object-cover",
              onError: (e) => {
                e.target.src = STOCK_PHOTOS[0];
              }
            }
          ) }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-stone-500", children: "Select an image file. It will be uploaded to Cloudinary when you save." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowModal(false),
              className: "flex-1 py-2.5 px-4 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: saving,
              className: "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                saving ? "Saving..." : "Save Product"
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AdminProducts
};
