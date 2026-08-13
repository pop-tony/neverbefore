import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

export default function ProductGrid({ products = [] }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!products.length) {
    return (
      <div className="py-32 text-center">
        <p className="text-xl text-zinc-500">No formulas found</p>
        <p className="mt-2 text-sm text-zinc-400">Check back soon for new rituals</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {products.map(product => (
        <motion.div key={product.id} variants={item}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
