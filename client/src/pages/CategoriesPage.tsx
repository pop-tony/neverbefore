import { useState, useEffect } from 'react';
import { productsApi, type Product } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag } from 'lucide-react';
import { getCategoryImage, useSiteContent } from '../lib/siteContent';

export function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { content } = useSiteContent();

  useEffect(() => {
    productsApi.list().then((data) => {
      setProducts(data);
      if (data.length > 0) {
        const categories = [...new Set(data.map((p) => p.category).filter(Boolean))];
        if (categories.length > 0) setActiveCategory(categories[0]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-light text-stone-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
        {content.category_heading}
      </h1>
      <p className="text-stone-500 mb-8">{content.category_subtitle}</p>

      {categories.length === 0 ? (
        <p className="text-stone-500">No categories available.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
                }`}
                style={activeCategory === cat ? { background: 'var(--color-pink)' } : undefined}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                <div className="aspect-square overflow-hidden bg-stone-100">
                  <img
                    src={product.image_url || getCategoryImage(content, product.category || '')}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-stone-400 mb-1">{product.category}</p>
                  <h3 className="text-sm font-medium text-stone-800 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-stone-800">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                      style={{ background: 'var(--color-pink)' }}
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
