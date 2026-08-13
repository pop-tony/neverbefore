import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { contentApi } from "../../lib/api";
import { normalizeSiteContent } from "../../lib/siteContent";
import { fileToDataUrl } from "../../lib/fileUploads";
import { Plus, Trash2, Save, Sparkles } from "lucide-react";
const emptyCategory = () => ({ name: "", image_url: "", description: "" });
const fieldStyle = "w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800";
function AdminContent() {
  const [content, setContent] = useState(normalizeSiteContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  useEffect(() => {
    contentApi.get().then((data) => {
      if (data) {
        setContent(normalizeSiteContent(data));
      }
    }).catch(() => {
      setMessage("Unable to load site content.");
    }).finally(() => setLoading(false));
  }, []);
  const updateField = (key, value) => {
    setContent((current) => ({ ...current, [key]: value }));
  };
  const updateCategory = (index, key, value) => {
    setContent((current) => {
      const categories = [...current.categories];
      categories[index] = { ...categories[index], [key]: value };
      return { ...current, categories };
    });
  };
  const handleSingleImageSelect = async (field, file) => {
    if (!file) return;
    try {
      const imageDataUrl = await fileToDataUrl(file);
      updateField(field, imageDataUrl);
    } catch {
      setMessage("Failed to read selected image.");
    }
  };
  const handleHeroImagesSelect = async (files) => {
    if (!files || files.length === 0) return;
    try {
      const imageUrls = await Promise.all(Array.from(files).map((file) => fileToDataUrl(file)));
      setContent((current) => ({
        ...current,
        hero_images: [...current.hero_images, ...imageUrls]
      }));
    } catch {
      setMessage("Failed to read one of the selected hero images.");
    }
  };
  const handleCategoryImageSelect = async (index, file) => {
    if (!file) return;
    try {
      const imageDataUrl = await fileToDataUrl(file);
      updateCategory(index, "image_url", imageDataUrl);
    } catch {
      setMessage("Failed to read selected category image.");
    }
  };
  const saveContent = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...content,
        hero_images: content.hero_images.map((image) => image.trim()).filter(Boolean),
        categories: content.categories.map((category) => ({
          name: category.name.trim(),
          image_url: category.image_url.trim(),
          description: category.description.trim()
        }))
      };
      const updated = await contentApi.update(payload);
      setContent(normalizeSiteContent(updated));
      setMessage("Site content saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save site content.");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "py-12 text-center text-stone-500", children: "Loading site content..." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-light text-stone-800 mb-2", style: { fontFamily: "Georgia, serif" }, children: "Site Content" }),
        /* @__PURE__ */ jsx("p", { className: "text-stone-500 max-w-2xl", children: "Edit the text, images, and labels used across the storefront. Changes save directly to the database and update the frontend content layer." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: saveContent,
          disabled: saving,
          className: "flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-70",
          children: [
            /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
            saving ? "Saving..." : "Save Changes"
          ]
        }
      )
    ] }),
    message && /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700", children: message }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("section", { className: "bg-white rounded-2xl shadow-sm p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-stone-800 font-medium", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-rose-500" }),
          "Brand and hero"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Brand name" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.brand_name, onChange: (e) => updateField("brand_name", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Brand tagline" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.brand_tagline, onChange: (e) => updateField("brand_tagline", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Logo image" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              className: fieldStyle,
              onChange: (e) => handleSingleImageSelect("logo_url", e.target.files?.[0] || null)
            }
          ),
          content.logo_url && /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("img", { src: content.logo_url, alt: "Logo preview", className: "w-14 h-14 rounded-full object-cover border border-stone-200" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-stone-500", children: "Saved as a hosted image after upload." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Hero title" }),
          /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.hero_title, onChange: (e) => updateField("hero_title", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Hero subtitle" }),
          /* @__PURE__ */ jsx("textarea", { className: fieldStyle, rows: 3, value: content.hero_subtitle, onChange: (e) => updateField("hero_subtitle", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Hero button text" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.hero_cta_label, onChange: (e) => updateField("hero_cta_label", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Hero button link" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.hero_cta_href, onChange: (e) => updateField("hero_cta_href", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Hero images" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              multiple: true,
              className: fieldStyle,
              onChange: (e) => handleHeroImagesSelect(e.target.files)
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-stone-500", children: "Select one or more image files. They will be uploaded to Cloudinary when you save." }),
          content.hero_images.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3", children: content.hero_images.map((image, index) => /* @__PURE__ */ jsxs("div", { className: "relative rounded-lg overflow-hidden border border-stone-200 bg-stone-50", children: [
            /* @__PURE__ */ jsx("img", { src: image, alt: `Hero ${index + 1}`, className: "w-full h-24 object-cover" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setContent((current) => ({
                  ...current,
                  hero_images: current.hero_images.filter((_, imageIndex) => imageIndex !== index)
                })),
                className: "absolute top-2 right-2 rounded-full bg-black/60 text-white w-6 h-6 text-xs",
                "aria-label": `Remove hero image ${index + 1}`,
                children: "\xD7"
              }
            )
          ] }, `${image}-${index}`)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "bg-white rounded-2xl shadow-sm p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-stone-800 font-medium", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-rose-500" }),
          "Shop copy"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Shop heading" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.shop_heading, onChange: (e) => updateField("shop_heading", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Shop subheading" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.shop_subheading, onChange: (e) => updateField("shop_subheading", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Empty state title" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.empty_title, onChange: (e) => updateField("empty_title", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Empty state message" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.empty_message, onChange: (e) => updateField("empty_message", e.target.value) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "bg-white rounded-2xl shadow-sm p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-stone-800 font-medium", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-rose-500" }),
          "Navigation and footer"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Home label" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.navigation_home, onChange: (e) => updateField("navigation_home", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Shop label" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.navigation_shop, onChange: (e) => updateField("navigation_shop", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Cart label" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.navigation_cart, onChange: (e) => updateField("navigation_cart", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Contact label" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.navigation_contact, onChange: (e) => updateField("navigation_contact", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Categories label" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.navigation_categories, onChange: (e) => updateField("navigation_categories", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Orders label" }),
            /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.navigation_orders, onChange: (e) => updateField("navigation_orders", e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Footer note" }),
          /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.footer_note, onChange: (e) => updateField("footer_note", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Support email" }),
          /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.support_email, onChange: (e) => updateField("support_email", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Support phone" }),
          /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.support_phone, onChange: (e) => updateField("support_phone", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-stone-600 mb-1.5", children: "Footer copyright" }),
          /* @__PURE__ */ jsx("input", { className: fieldStyle, value: content.copyright_prefix, onChange: (e) => updateField("copyright_prefix", e.target.value) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "bg-white rounded-2xl shadow-sm p-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-stone-800", children: "Categories" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-500", children: "These cards control the category artwork shown on the storefront." })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setContent((current) => ({ ...current, categories: [...current.categories, emptyCategory()] })),
            className: "flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Add category"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: content.categories.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-stone-500", children: "No category cards yet. Add one to replace static storefront imagery." }) : content.categories.map((category, index) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-3 items-start rounded-xl border border-stone-200 p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-stone-500 mb-1", children: "Name" }),
          /* @__PURE__ */ jsx("input", { className: fieldStyle, value: category.name, onChange: (e) => updateCategory(index, "name", e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-stone-500 mb-1", children: "Image" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              className: fieldStyle,
              onChange: (e) => handleCategoryImageSelect(index, e.target.files?.[0] || null)
            }
          ),
          category.image_url && /* @__PURE__ */ jsx("div", { className: "mt-2 w-20 h-20 rounded-lg overflow-hidden bg-stone-100", children: /* @__PURE__ */ jsx("img", { src: category.image_url, alt: `${category.name || "Category"} preview`, className: "w-full h-full object-cover" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-stone-500 mb-1", children: "Description" }),
          /* @__PURE__ */ jsx("input", { className: fieldStyle, value: category.description, onChange: (e) => updateCategory(index, "description", e.target.value) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-1 flex justify-end lg:pt-6", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setContent((current) => ({ ...current, categories: current.categories.filter((_, itemIndex) => itemIndex !== index) })),
            className: "p-2 rounded-lg hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors",
            "aria-label": "Remove category",
            children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
          }
        ) })
      ] }, `${category.name}-${index}`)) })
    ] })
  ] });
}
export {
  AdminContent
};
