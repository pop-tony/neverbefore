import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const { id, name, price, images, condition = 'New', category } = product;

  return (
    <div className="group relative">
      <div
        onClick={() => navigate(`/product/${id}`)}
        className="aspect-[3/4] w-full cursor-pointer overflow-hidden bg-zinc-100 dark:bg-zinc-900"
      >
        <img
          src={images[0]}
          alt={name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {condition !== 'New' && (
          <div className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            {condition}
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 opacity-0 backdrop-blur-md transition group-hover:opacity-100 dark:bg-black/90"
        aria-label="Add to wishlist"
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#C5A059] text-[#C5A059]' : 'text-zinc-700 dark:text-zinc-300'}`} />
      </button>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{category}</p>
        <h3
          onClick={() => navigate(`/product/${id}`)}
          className="mt-1 cursor-pointer text-sm font-semibold hover:text-[#C5A059] line-clamp-1"
        >
          {name}
        </h3>
        <p className="mt-1 text-lg font-bold">₵{price}</p>
      </div>
    </div>
  );
}
