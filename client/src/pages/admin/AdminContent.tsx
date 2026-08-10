import { useEffect, useState } from 'react';
import { contentApi, type SiteCategoryContent, type SiteContent } from '../../lib/api';
import { normalizeSiteContent } from '../../lib/siteContent';
import { fileToDataUrl } from '../../lib/fileUploads';
import { Plus, Trash2, Save, Sparkles } from 'lucide-react';

const emptyCategory = (): SiteCategoryContent => ({ name: '', image_url: '', description: '' });

const fieldStyle = 'w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800';

export function AdminContent() {
  const [content, setContent] = useState<SiteContent>(normalizeSiteContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    contentApi.get().then((data) => {
      if (data) {
        setContent(normalizeSiteContent(data));
      }
    }).catch(() => {
      setMessage('Unable to load site content.');
    }).finally(() => setLoading(false));
  }, []);

  const updateField = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setContent((current) => ({ ...current, [key]: value }));
  };

  const updateCategory = (index: number, key: keyof SiteCategoryContent, value: string) => {
    setContent((current) => {
      const categories = [...current.categories];
      categories[index] = { ...categories[index], [key]: value };
      return { ...current, categories };
    });
  };

  const handleSingleImageSelect = async (field: 'logo_url', file: File | null) => {
    if (!file) return;

    try {
      const imageDataUrl = await fileToDataUrl(file);
      updateField(field, imageDataUrl);
    } catch {
      setMessage('Failed to read selected image.');
    }
  };

  const handleHeroImagesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const imageUrls = await Promise.all(Array.from(files).map((file) => fileToDataUrl(file)));
      setContent((current) => ({
        ...current,
        hero_images: [...current.hero_images, ...imageUrls],
      }));
    } catch {
      setMessage('Failed to read one of the selected hero images.');
    }
  };

  const handleCategoryImageSelect = async (index: number, file: File | null) => {
    if (!file) return;

    try {
      const imageDataUrl = await fileToDataUrl(file);
      updateCategory(index, 'image_url', imageDataUrl);
    } catch {
      setMessage('Failed to read selected category image.');
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
          description: category.description.trim(),
        })),
      };
      const updated = await contentApi.update(payload);
      setContent(normalizeSiteContent(updated));
      setMessage('Site content saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save site content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-stone-500">Loading site content...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-light text-stone-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>Site Content</h1>
          <p className="text-stone-500 max-w-2xl">Edit the text, images, and labels used across the storefront. Changes save directly to the database and update the frontend content layer.</p>
        </div>
        <button
          onClick={saveContent}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-70"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-stone-800 font-medium"><Sparkles className="w-4 h-4 text-rose-500" />Brand and hero</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Brand name</label>
              <input className={fieldStyle} value={content.brand_name} onChange={(e) => updateField('brand_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Brand tagline</label>
              <input className={fieldStyle} value={content.brand_tagline} onChange={(e) => updateField('brand_tagline', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Logo image</label>
            <input
              type="file"
              accept="image/*"
              className={fieldStyle}
              onChange={(e) => handleSingleImageSelect('logo_url', e.target.files?.[0] || null)}
            />
            {content.logo_url && (
              <div className="mt-2 flex items-center gap-3">
                <img src={content.logo_url} alt="Logo preview" className="w-14 h-14 rounded-full object-cover border border-stone-200" />
                <span className="text-xs text-stone-500">Saved as a hosted image after upload.</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Hero title</label>
            <input className={fieldStyle} value={content.hero_title} onChange={(e) => updateField('hero_title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Hero subtitle</label>
            <textarea className={fieldStyle} rows={3} value={content.hero_subtitle} onChange={(e) => updateField('hero_subtitle', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Hero button text</label>
              <input className={fieldStyle} value={content.hero_cta_label} onChange={(e) => updateField('hero_cta_label', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Hero button link</label>
              <input className={fieldStyle} value={content.hero_cta_href} onChange={(e) => updateField('hero_cta_href', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Hero images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className={fieldStyle}
              onChange={(e) => handleHeroImagesSelect(e.target.files)}
            />
            <p className="mt-1 text-xs text-stone-500">Select one or more image files. They will be uploaded to Cloudinary when you save.</p>
            {content.hero_images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {content.hero_images.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                    <img src={image} alt={`Hero ${index + 1}`} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => setContent((current) => ({
                        ...current,
                        hero_images: current.hero_images.filter((_, imageIndex) => imageIndex !== index),
                      }))}
                      className="absolute top-2 right-2 rounded-full bg-black/60 text-white w-6 h-6 text-xs"
                      aria-label={`Remove hero image ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-stone-800 font-medium"><Sparkles className="w-4 h-4 text-rose-500" />Shop copy</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Shop heading</label>
              <input className={fieldStyle} value={content.shop_heading} onChange={(e) => updateField('shop_heading', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Shop subheading</label>
              <input className={fieldStyle} value={content.shop_subheading} onChange={(e) => updateField('shop_subheading', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Empty state title</label>
              <input className={fieldStyle} value={content.empty_title} onChange={(e) => updateField('empty_title', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Empty state message</label>
              <input className={fieldStyle} value={content.empty_message} onChange={(e) => updateField('empty_message', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-stone-800 font-medium"><Sparkles className="w-4 h-4 text-rose-500" />Navigation and footer</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-stone-600 mb-1.5">Home label</label><input className={fieldStyle} value={content.navigation_home} onChange={(e) => updateField('navigation_home', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-stone-600 mb-1.5">Shop label</label><input className={fieldStyle} value={content.navigation_shop} onChange={(e) => updateField('navigation_shop', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-stone-600 mb-1.5">Cart label</label><input className={fieldStyle} value={content.navigation_cart} onChange={(e) => updateField('navigation_cart', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-stone-600 mb-1.5">Contact label</label><input className={fieldStyle} value={content.navigation_contact} onChange={(e) => updateField('navigation_contact', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-stone-600 mb-1.5">Categories label</label><input className={fieldStyle} value={content.navigation_categories} onChange={(e) => updateField('navigation_categories', e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-stone-600 mb-1.5">Orders label</label><input className={fieldStyle} value={content.navigation_orders} onChange={(e) => updateField('navigation_orders', e.target.value)} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Footer note</label>
            <input className={fieldStyle} value={content.footer_note} onChange={(e) => updateField('footer_note', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Support email</label>
            <input className={fieldStyle} value={content.support_email} onChange={(e) => updateField('support_email', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Support phone</label>
            <input className={fieldStyle} value={content.support_phone} onChange={(e) => updateField('support_phone', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Footer copyright</label>
            <input className={fieldStyle} value={content.copyright_prefix} onChange={(e) => updateField('copyright_prefix', e.target.value)} />
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-medium text-stone-800">Categories</h2>
            <p className="text-sm text-stone-500">These cards control the category artwork shown on the storefront.</p>
          </div>
          <button
            onClick={() => setContent((current) => ({ ...current, categories: [...current.categories, emptyCategory()] }))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add category
          </button>
        </div>
        <div className="space-y-4">
          {content.categories.length === 0 ? (
            <p className="text-sm text-stone-500">No category cards yet. Add one to replace static storefront imagery.</p>
          ) : (
            content.categories.map((category, index) => (
              <div key={`${category.name}-${index}`} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start rounded-xl border border-stone-200 p-4">
                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Name</label>
                  <input className={fieldStyle} value={category.name} onChange={(e) => updateCategory(index, 'name', e.target.value)} />
                </div>
                <div className="lg:col-span-5">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className={fieldStyle}
                    onChange={(e) => handleCategoryImageSelect(index, e.target.files?.[0] || null)}
                  />
                  {category.image_url && (
                    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-stone-100">
                      <img src={category.image_url} alt={`${category.name || 'Category'} preview`} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Description</label>
                  <input className={fieldStyle} value={category.description} onChange={(e) => updateCategory(index, 'description', e.target.value)} />
                </div>
                <div className="lg:col-span-1 flex justify-end lg:pt-6">
                  <button
                    onClick={() => setContent((current) => ({ ...current, categories: current.categories.filter((_, itemIndex) => itemIndex !== index) }))}
                    className="p-2 rounded-lg hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors"
                    aria-label="Remove category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}