import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useProducts } from '../hooks/useProducts';

export default function ShopSection() {
  const navigate = useNavigate();
  const { content } = useSiteContent();
  const { products, loading } = useProducts();
  const featured = products.filter(p => p.featured === true).slice(0, 4);

  return (
    <section className="bg-[#F8F5F1] px-4 py-20 text-zinc-900 dark:bg-[#0C0C0E] dark:text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C5A059]">Curated collection</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-5xl">{content?.shop_heading || 'Gold Rituals'}</h2>
            <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">{content?.shop_subheading || 'Curated formulas for your most radiant self'}</p>
          </div>

          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-900 transition hover:border-[#C5A059] hover:text-[#C5A059] dark:border-zinc-700 dark:bg-zinc-900 dark:text-white md:self-auto"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {loading ? <p className="col-span-full text-sm text-zinc-500">Loading products...</p> : featured.map(product => (
            <div key={product.id} className="store-card">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <button
            onClick={() => navigate('/shop')}
            className="rounded-full border-2 border-zinc-900 bg-zinc-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-[#C5A059] hover:border-[#C5A059] dark:border-white dark:bg-white dark:text-black dark:hover:bg-[#C5A059] dark:hover:text-white"
          >
            View all formulas
          </button>
        </div>
      </div>
    </section>
  );
}
