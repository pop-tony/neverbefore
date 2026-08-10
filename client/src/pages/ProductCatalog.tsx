import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product } from '../types/database';
import { productsApi } from '../lib/api';
import { formatPrice } from '../lib/format';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, Plus, Minus, Sparkles, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { getCategoryImage, useSiteContent } from '../lib/siteContent';

const DEFAULT_FALLBACK_IMAGE = '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg';

/* ════════════════════════════════════════════════════════════
 *  HeroCarousel — pink banner with discount text + product photo
 * ════════════════════════════════════════════════════════════ */
function HeroCarousel({ content }: { content: ReturnType<typeof useSiteContent>['content'] }) {
  const [slide, setSlide] = useState(0);
  const slides = content.hero_images.length > 0 ? content.hero_images : [content.logo_url];
  const next = useCallback(() => setSlide((s) => (s + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setSlide((s) => (s - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="relative w-full overflow-hidden" style={{ backgroundColor: 'var(--color-pink-bg)' }}>
      <div className="relative flex items-center min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]">
        {/* Repeating "DISCOUNT" backdrop text */}
        <div className="absolute inset-0 flex flex-col justify-center gap-1 overflow-hidden opacity-40 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="discount-repeat-text">
              DISCOUNT&nbsp;DISCOUNT&nbsp;DISCOUNT&nbsp;DISCOUNT&nbsp;DISCOUNT&nbsp;DISCOUNT&nbsp;DISCOUNT&nbsp;DISCOUNT
            </div>
          ))}
        </div>

        {/* Left: promo copy */}
        <div className="relative z-10 flex-1 px-6 sm:px-12 lg:px-16 py-8">
          <p className="text-xs sm:text-sm font-medium text-white/80 tracking-widest uppercase mb-2" style={{ fontFamily: 'var(--font-body)' }}>
            {content.hero_badge}
          </p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-normal text-white max-w-md leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {content.hero_title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-sm" style={{ fontFamily: 'var(--font-body)' }}>
            {content.hero_subtitle}
          </p>
          <a
            href={content.hero_cta_href}
            className="inline-block mt-5 px-6 py-2.5 rounded-full text-sm font-medium text-white border border-white/60 hover:bg-white/10 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {content.hero_cta_label}
          </a>
        </div>

        {/* Right: product photo */}
        <div className="relative z-10 hidden sm:block w-[40%] lg:w-[35%] h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[420px]">
          <img
            src={slides[slide]}
            alt="Featured product"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent" style={{ background: 'linear-gradient(to right, var(--color-pink-bg) 0%, transparent 30%)' }} />
        </div>

        {/* Carousel controls */}
        <button onClick={prev} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors" aria-label="Previous slide">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={next} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors" aria-label="Next slide">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`carousel-dot ${i === slide ? 'active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 *  CategoryRow — "Shop by Category" rounded tiles
 * ════════════════════════════════════════════════════════════ */
function CategoryRow({ categories, selected, onSelect, content }: {
  categories: string[];
  selected: string | null;
  onSelect: (cat: string | null) => void;
  content: ReturnType<typeof useSiteContent>['content'];
}) {
  const displayCats = categories.length > 0 ? categories : content.categories.map((category) => category.name).filter(Boolean);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <h3 className="text-xl sm:text-2xl font-normal text-[#1a1d20] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
        {content.category_heading}
      </h3>
      <p className="text-sm text-stone-500 mb-5">{content.category_subtitle}</p>
      <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-2 -mx-1 px-1">
        {displayCats.map((cat) => {
          const img = getCategoryImage(content, cat);
          const isActive = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(isActive ? null : cat)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 group transition-transform ${isActive ? 'scale-95' : 'hover:scale-105'}`}
            >
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden border-2 transition-colors"
                style={{ borderColor: isActive ? 'var(--color-gold)' : 'transparent' }}
              >
                <img src={img} alt={cat} className="w-full h-full object-cover" />
              </div>
              <span className={`text-xs sm:text-sm font-medium ${isActive ? '' : 'text-[#1a1d20]'} text-center`} style={isActive ? { color: 'var(--color-gold)' } : undefined}>
                {cat}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════
 *  ProductCard — grid item with qty selector + add button
 * ════════════════════════════════════════════════════════════ */
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  fallbackImage: string;
}

function ProductCard({ product, onAddToCart, fallbackImage }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  const displayImage = product.image_url || fallbackImage;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-gold)' }}>
            {product.category}
          </span>
        )}
        <h3 className="text-stone-800 font-medium mt-1 truncate">{product.name}</h3>
        {product.description && (
          <p className="text-stone-500 text-sm mt-1 line-clamp-2">{product.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-stone-800">
            {formatPrice(product.price)}
          </span>
          {product.stock_quantity > 0 ? (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              In Stock
            </span>
          ) : (
            <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {product.stock_quantity > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 flex items-center justify-center rounded-full border text-stone-600 hover:bg-stone-50 transition-colors"
              style={{ borderColor: 'var(--stone-200)' }}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-stone-700">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-full border text-stone-600 hover:bg-stone-50 transition-colors"
              style={{ borderColor: 'var(--stone-200)' }}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddToCart}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all"
              style={{ background: 'linear-gradient(to right, var(--color-pink), var(--color-gold-light))' }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
 *  CartSidebar — slide-out cart drawer
 * ════════════════════════════════════════════════════════════ */
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--stone-200)' }}>
          <h2 className="text-lg font-medium text-stone-800">Your Cart</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-4 bg-stone-50 rounded-lg">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-rose-50 to-amber-50 flex-shrink-0">
                    <img src={item.product.image_url || DEFAULT_FALLBACK_IMAGE} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-stone-800 truncate">{item.product.name}</h4>
                    <p className="text-sm text-stone-500 mt-0.5">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border text-stone-600 hover:bg-stone-100 transition-colors"
                        style={{ borderColor: 'var(--stone-200)' }}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-stone-700 w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border text-stone-600 hover:bg-stone-100 transition-colors"
                        style={{ borderColor: 'var(--stone-200)' }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} className="ml-auto text-xs text-rose-500 hover:text-rose-600 px-2 py-2">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-stone-50" style={{ borderColor: 'var(--stone-200)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-stone-600">Subtotal</span>
              <span className="text-lg font-semibold text-stone-800">{formatPrice(totalPrice)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 px-4 rounded-lg text-white font-medium tracking-wide shadow-md hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(to right, var(--color-pink), var(--color-gold-light))' }}
            >
              Proceed to Checkout
            </button>
            <button onClick={clearCart} className="w-full mt-2 py-2 text-sm text-stone-500 hover:text-stone-700">
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
 *  ProductCatalog — homepage: hero + categories + filter + grid
 * ════════════════════════════════════════════════════════════ */
export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
      // leave products empty on error
    }
    setLoading(false);
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  const fallbackImage = useMemo(() => content.hero_images[0] || content.logo_url, [content.hero_images, content.logo_url]);

  if (loading || contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-off-white)' }}>
        <div className="flex flex-col items-center">
          <Sparkles className="w-10 h-10 animate-pulse" style={{ color: 'var(--color-gold)' }} />
          <p className="mt-4 text-stone-500">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero carousel banner */}
      <HeroCarousel content={content} />

      {/* Shop by Category */}
      <CategoryRow categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} content={content} />

      {/* Shop section */}
      <main id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Section heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-normal text-[#1a1d20]" style={{ fontFamily: 'var(--font-display)' }}>
              {selectedCategory ? selectedCategory : content.shop_heading}
            </h3>
            <p className="text-sm text-stone-500 mt-1">
              {content.shop_subheading} · {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>

        {/* Filter + search bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors whitespace-nowrap" style={{ borderColor: 'var(--stone-200)' }}>
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2.5 pr-28 rounded-full border bg-white outline-none transition-all text-stone-800 placeholder-stone-400"
              style={{ borderColor: 'var(--stone-200)' }}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-white text-sm font-medium shadow-sm" style={{ background: 'var(--color-pink)' }}>
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory ? 'text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
            style={!selectedCategory ? { background: 'var(--color-pink)' } : { border: '1px solid var(--stone-200)' }}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category ? 'text-white' : 'bg-white text-stone-600 hover:bg-stone-50'
              }`}
              style={selectedCategory === category ? { background: 'var(--color-pink)' } : { border: '1px solid var(--stone-200)' }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 mx-auto text-stone-300 mb-4" />
            <h2 className="text-xl font-medium text-stone-700">{content.empty_title}</h2>
            <p className="text-stone-500 mt-2">{content.empty_message}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500">No products matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} fallbackImage={fallbackImage} />
            ))}
          </div>
        )}
      </main>

      {/* Contact footer */}
      <footer id="contact" className="border-t mt-8" style={{ borderColor: 'var(--stone-200)', backgroundColor: 'var(--color-off-white)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={content.logo_url} alt={content.brand_name} className="w-10 h-10 rounded-full object-cover border" style={{ borderColor: 'var(--color-gold)' }} />
              <span className="figma-logo-text">
                {content.brand_name}
              </span>
            </div>
            <p className="text-sm text-stone-500" style={{ fontFamily: 'var(--font-body)' }}>
              {content.footer_note}
            </p>
            <div className="text-sm text-stone-400 text-center sm:text-right space-y-1">
              <p>&copy; {new Date().getFullYear()} {content.copyright_prefix}</p>
              {(content.support_email || content.support_phone) && (
                <p>
                  {content.support_email && <span>{content.support_email}</span>}
                  {content.support_email && content.support_phone && <span> · </span>}
                  {content.support_phone && <span>{content.support_phone}</span>}
                </p>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
