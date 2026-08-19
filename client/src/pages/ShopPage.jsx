import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';

// Never Before Cosmetic categories
const categories = ['All', 'Skincare', 'Makeup', 'Lips', 'Fragrance', 'Body', 'New Alchemy'];
const INITIAL_SHOW = 8;

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') || 'All';
  const urlSearch = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [showAll, setShowAll] = useState({});
  const { products, loading, error } = useProducts();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory!== 'All') params.set('category', activeCategory);
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    setSearchParams(params, { replace: true });
  }, [activeCategory, debouncedSearch, setSearchParams]);

  useEffect(() => {
    setActiveCategory(urlCategory);
    setSearchInput(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlCategory, urlSearch]);

  const isSearching = debouncedSearch.trim();
  const isFiltered = activeCategory!== 'All' || isSearching;

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory!== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (isSearching) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.seller?.toLowerCase().includes(query) ||
        p.details?.some(d => d.toLowerCase().includes(query)) ||
        p.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    return result;
  }, [activeCategory, debouncedSearch, isSearching, products]);

  // Cosmetic sections for "All" view
  const sections = useMemo(() => {
    if (isFiltered) return [];
    return [
      {
        title: "New Alchemy",
        subtitle: "Never seen before",
        category: 'New Alchemy',
        products: products.filter(p => p.tags?.includes('new') || p.new)
      },
      {
        title: "Skin Rituals",
        subtitle: "Gold-standard skincare",
        category: 'Skincare',
        products: products.filter(p => p.category === 'Skincare')
      },
      {
        title: "Velvet Complexion",
        subtitle: "Soft-focus finish",
        category: 'Makeup',
        products: products.filter(p => p.category === 'Makeup')
      },
      {
        title: "Lips Atelier",
        subtitle: "Your signature shade",
        category: 'Lips',
        products: products.filter(p => p.category === 'Lips')
      },
      {
        title: "Essence",
        subtitle: "Fragrance as memory",
        category: 'Fragrance',
        products: products.filter(p => p.category === 'Fragrance')
      },
      {
        title: "Body Luminous",
        subtitle: "Gilded from within",
        category: 'Body',
        products: products.filter(p => p.category === 'Body')
      },
    ].filter(s => s.products.length > 0);
  }, [isFiltered, products]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSearchInput('');
    setDebouncedSearch('');
    setShowAll({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleShowAll = (key) => {
    setShowAll(prev => ({...prev, [key]:!prev[key] }));
  };

  const clearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setActiveCategory('All');
    setShowAll({});
  };

  const visibleFiltered = showAll['filtered']? filtered : filtered.slice(0, INITIAL_SHOW);
  const canShowMoreFiltered = filtered.length > INITIAL_SHOW;

  return (
    <div className="min-h-screen bg-[#FFFEFB] text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 pt-24">
        {/* Header + Search */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text- uppercase tracking-[0.3em] text-[#C5A059]">Never Before Cosmetic</p>
            <h1 className="mb-3 font-serif text-4xl font-light tracking-tight md:text-5xl">
              {isSearching? 'Search Results' : activeCategory!== 'All'? activeCategory : 'The Atelier'}
            </h1>
            <p className="text-sm tracking-wide text-zinc-500 dark:text-zinc-400">
              {isSearching
              ? `Results for "${debouncedSearch}"`
                : activeCategory!== 'All'
              ? `${filtered.length} formulas in ${activeCategory}`
                : 'Curated rituals for skin that glows like never before'}
            </p>
            {loading && <p className="mt-2 text-xs text-zinc-500">Loading catalog...</p>}
            {error && <p className="mt-2 text-xs text-red-500">Unable to load products from the database.</p>}
            {isFiltered && filtered.length > 0 && (
              <p className="mt-2 text-xs uppercase tracking-[0.15em] text-[#C5A059]">{filtered.length} formulas found</p>
            )}
          </div>

          {/* Search - Gold */}
          <div className="w-full lg:w-96">
            <div className="flex rounded-full border border-[#F5EFE6] bg-white focus-within:border-[#C5A059] shadow-sm transition dark:border-zinc-700 dark:bg-zinc-900">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search serums, lip tints, rituals..."
                className="flex-1 bg-transparent px-6 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />
              {searchInput && (
                <button onClick={clearSearch} className="p-2 text-zinc-400 hover:text-zinc-600">
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="m-1 rounded-full bg-[#C5A059] p-2.5 text-white">
                <Search className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-16">
          <CategoryFilter
            categories={categories}
            active={activeCategory}
            onChange={handleCategoryChange}
          />
        </div>

        {isFiltered? (
          <>
            {filtered.length === 0? (
              <div className="py-32 text-center">
                <p className="mb-2 font-serif text-xl text-zinc-500">No formulas found</p>
                <p className="mb-6 text-sm text-zinc-400">Try a different ritual name</p>
                <button onClick={clearSearch} className="text-xs uppercase tracking-[0.2em] font-semibold text-[#C5A059] hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <motion.div layout className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                  <AnimatePresence initial={false}>
                    {visibleFiltered.map((product, i) => (
                      <motion.div key={product.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, delay: i * 0.02 }}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
                {canShowMoreFiltered && (
                  <div className="mt-12 text-center">
                    <button onClick={() => toggleShowAll('filtered')} className="inline-flex items-center gap-2 rounded-full border border-[#F5EFE6] bg-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-700 transition hover:border-[#C5A059] hover:text-[#C5A059]">
                      {showAll['filtered']? <>Show Less <ChevronUp className="h-4 w-4" /></> : <>Show All {filtered.length} Formulas <ChevronDown className="h-4 w-4" /></>}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="space-y-20">
            {sections.map((section, idx) => {
              const isExpanded = showAll[section.category];
              const displayProducts = isExpanded? section.products : section.products.slice(0, 4);
              const hasMore = section.products.length > 4;
              return (
                <div key={idx}>
                  <div className="mb-8 flex items-end justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-light md:text-3xl">{section.title}</h2>
                      <p className="mt-1 text- uppercase tracking-[0.2em] text-[#C5A059]">{section.subtitle}</p>
                    </div>
                    {hasMore && (
                      <button onClick={() => toggleShowAll(section.category)} className="flex items-center gap-2 text- font-bold uppercase tracking-[0.2em] hover:text-[#C5A059]">
                        {isExpanded? <>Show Less <ChevronUp className="h-3.5 w-3.5" /></> : <>View All {section.products.length} <ChevronDown className="h-3.5 w-3.5" /></>}
                      </button>
                    )}
                  </div>
                  <div className={`${isExpanded? 'grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4' : 'flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin'}`}>
                    <AnimatePresence initial={false}>
                      {displayProducts.map((product, i) => (
                        <motion.div key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={!isExpanded? 'w-64 flex-shrink-0 snap-start' : ''}>
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}