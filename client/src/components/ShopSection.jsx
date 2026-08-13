import ProductCard from './ProductCard';
import { allProducts } from '../data/products';
import { useNavigate } from 'react-router-dom';

export default function ShopSection() {
  const navigate = useNavigate();
  const featured = allProducts.filter(p=>p.featured === true);

  return (
    <section className="bg-white px-4 py-20 text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-black md:text-5xl">Gold Rituals</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Curated formulas for your most radiant self</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="hidden text-sm font-bold text-zinc-900 hover:text-[#C5A059] dark:text-white md:block"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <button
            onClick={() => navigate('/shop')}
            className="rounded-full border-2 border-zinc-900 px-8 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            View All Formulas
          </button>
        </div>
      </div>
    </section>
  );
}
