import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Heart, ChevronLeft, Minus, Plus, Truck, RotateCcw } from 'lucide-react';
import { allProducts } from '../data/products';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = allProducts.find(p => p.id == id);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (product?.sizes?.length) setSelectedSize(product.sizes[0]);
    if (product?.colors?.length) {
      const firstColor = product.colors[0];
      setSelectedColor(typeof firstColor === 'string'? firstColor : firstColor.name);
    }
    window.scrollTo(0, 0);
  }, [product]);

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-zinc-900 dark:bg-black dark:text-white">
        <div className="text-center">
          <p className="text-xl">Product not found</p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 rounded-full bg-black px-6 py-2 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            Back to Atelier
          </button>
        </div>
      </div>
    );
  }

  const { name, price, salePrice, images, description, sizes = [], colors = [], details = [], seller } = product;
  const isOnSale =!!salePrice;
  const displayPrice = salePrice || price;

  const handleAddToCart = () => {
    if (sizes.length &&!selectedSize) {
      alert('Please select a size');
      return;
    }
    if (colors.length &&!selectedColor) {
      alert('Please select a color');
      return;
    }

    const colorObj = colors.find(c =>
      (typeof c === 'string'? c : c.name) === selectedColor
    );
    const colorHex = typeof colorObj === 'string'? colorObj : colorObj?.hex;

    addToCart({
      id: product.id,
      name,
      price: Number(displayPrice),
      size: selectedSize || null,
      color: selectedColor || null,
      colorHex: colorHex || null,
      image: images[activeImage],
      quantity
    });
  };

  const relatedProducts = allProducts
.filter(p => p.category === product.category && p.id!== product.id)
.slice(0, 4);

  return (
    <div className="bg-white text-zinc-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 sm:py-12">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer mb-6 flex items-center gap-2 text-sm hover:text-[#C5A059]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="mb-4 aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 dark:bg-zinc-900">
              <img
                src={images[activeImage]}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                      activeImage === idx
                  ? 'border-black dark:border-white'
                        : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.tag && (
              <span className="mb-3 inline-block rounded-full bg-[#C5A059] px-3 py-1 text-xs font-bold text-white">
                {product.tag}
              </span>
            )}

            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
            {seller && (
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">by {seller}</p>
            )}

            <div className="mb-6 flex items-baseline gap-3">
              {isOnSale && (
                <span className="text-xl text-zinc-500 line-through dark:text-zinc-400">₵{price}</span>
              )}
              <span className="text-3xl font-bold">₵{displayPrice}</span>
              {isOnSale && (
                <span className="rounded bg-[#C5A059]/10 px-2 py-1 text-sm font-semibold text-[#C5A059] dark:bg-[#C5A059]/20 dark:text-[#E8D5B5]">
                  Save ₵{price - salePrice}
                </span>
              )}
            </div>

            <p className="mb-8 text-zinc-600 dark:text-zinc-300">{description}</p>

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Color: {selectedColor}</span>
                </div>
                <div className="flex gap-3">
                  {colors.map(color => {
                    const colorName = typeof color === 'string'? color : color.name;
                    const colorHex = typeof color === 'string'? color : color.hex;
                    return (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(colorName)}
                        className={`cursor-pointer h-10 w-10 rounded-full border-2 transition ${
                          selectedColor === colorName
                      ? 'border-black ring-2 ring-black ring-offset-2 dark:border-white dark:ring-white'
                          : 'border-zinc-300 dark:border-zinc-700'
                        }`}
                        style={{ backgroundColor: colorHex }}
                        aria-label={colorName}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Size</span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="cursor-pointer text-xs underline hover:text-[#C5A059]"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`cursor-pointer rounded-lg border-2 py-3 text-sm font-semibold transition ${
                        selectedSize === size
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                          : 'border-zinc-300 hover:border-black dark:border-zinc-700 dark:hover:border-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <span className="mb-3 block text-sm font-semibold">Quantity</span>
              <div className="flex w-fit items-center rounded-lg border border-zinc-300 dark:border-zinc-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={sizes.length > 0 &&!selectedSize}
                className="cursor-pointer flex-1 rounded-full bg-black py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {sizes.length > 0 &&!selectedSize? 'Select Size' : 'Add to Bag'}
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="cursor-pointer rounded-full border-2 border-zinc-300 p-4 transition hover:border-black dark:border-zinc-700 dark:hover:border-white"
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted? 'fill-[#C5A059] text-[#C5A059]' : ''}`}
                />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800">
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <Truck className="h-5 w-5" />
                <span>Free shipping on orders over ₵500</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                <RotateCcw className="h-5 w-5" />
                <span>Free returns within 7 days</span>
              </div>
            </div>

            {/* Product Details */}
            {details.length > 0 && (
              <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                <h3 className="mb-4 font-semibold">Details</h3>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {details.map((detail, idx) => (
                    <li key={idx}>• {detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Complete the Look */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-zinc-200 pt-16 dark:border-zinc-800">
            <h2 className="mb-8 text-2xl font-bold">Complete the Look</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {relatedProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="cursor-pointer group"
                >
                  <div className="mb-3 aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100 dark:bg-zinc-900">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">₵{p.salePrice || p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          onClick={() => setShowSizeGuide(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 text-zinc-900 dark:bg-zinc-900 dark:text-white"
          >
            <h3 className="mb-4 text-xl font-bold">Size Guide</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="pb-3 text-left">Size</th>
                  <th className="pb-3 text-left">Bust (in)</th>
                  <th className="pb-3 text-left">Waist (in)</th>
                  <th className="pb-3 text-left">Hips (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-800"><td className="py-3">XS</td><td>32-34</td><td>24-26</td><td>34-36</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800"><td className="py-3">S</td><td>34-36</td><td>26-28</td><td>36-38</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800"><td className="py-3">M</td><td>36-38</td><td>28-30</td><td>38-40</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800"><td className="py-3">L</td><td>38-40</td><td>30-32</td><td>40-42</td></tr>
                <tr><td className="py-3">XL</td><td>40-42</td><td>32-34</td><td>42-44</td></tr>
              </tbody>
            </table>
            <button
              onClick={() => setShowSizeGuide(false)}
              className="mt-6 w-full rounded-full bg-black py-3 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
