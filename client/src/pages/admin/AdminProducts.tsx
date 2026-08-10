import { useState, useEffect } from 'react';
import type { Product } from '../../types/database';
import { productsApi } from '../../lib/api';
import { fileToDataUrl } from '../../lib/fileUploads';
import { formatPrice } from '../../lib/format';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

const STOCK_PHOTOS = [
  'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2533486/pexels-photo-2533486.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/3685563/pexels-photo-3685563.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/3685565/pexels-photo-3685565.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/4041152/pexels-photo-4041152.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/7055860/pexels-photo-7055860.jpeg?auto=compress&cs=tinysrgb&w=400',
];

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  stock_quantity: string;
}

const emptyForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category: '',
  stock_quantity: '0',
};

const CATEGORIES = [
  'Lipstick',
  'Foundation',
  'Mascara',
  'Eyeshadow',
  'Blush',
  'Skincare',
  'Fragrance',
  'Nail Care',
  'Tools',
];

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch {
      // leave empty
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ ...emptyForm });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      category: product.category || '',
      stock_quantity: product.stock_quantity.toString(),
    });
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      image_url: formData.image_url || null,
      category: formData.category || null,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
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
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = async (file: File | null) => {
    if (!file) return;

    try {
      const imageDataUrl = await fileToDataUrl(file);
      setFormData((current) => ({ ...current, image_url: imageDataUrl }));
    } catch {
      setError('Failed to read selected image');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsApi.delete(productId);
      setProducts(products.filter((p) => p._id !== productId));
    } catch {
      // ignore error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-stone-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>
          Products
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-stone-500 mb-4">No products yet. Add your first product!</p>
          <button
            onClick={openAddModal}
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            Add Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0">
                          <img
                            src={product.image_url || STOCK_PHOTOS[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-stone-500 truncate max-w-xs">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                      {product.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-800">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        product.stock_quantity === 0
                          ? 'text-rose-600'
                          : product.stock_quantity < 10
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-rose-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 rounded-lg hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-stone-800">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800 resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-stone-800"
                />
                {formData.image_url && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-stone-100">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = STOCK_PHOTOS[0];
                      }}
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-stone-500">Select an image file. It will be uploaded to Cloudinary when you save.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-rose-400 to-amber-400 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
