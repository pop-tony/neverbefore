import { useEffect, useState } from 'react';
import axios from 'axios';
import { allProducts } from '../data/products';
import { useSiteContent } from './useSiteContent';

const configuredBase = (import.meta.env.VITE_BACKEND_URL || '/api').replace(/\/+$/, '');
const backendUrl = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;

export const normalizeProduct = (product) => {
  const image = product.image_url || product.image || '';
  const discount = Number(product.discount) || 0;
  const price = Number(product.price) || 0;

  return {
    ...product,
    id: product.id || product._id,
    image,
    images: product.images?.length ? product.images : image ? [image] : [],
    quantity: Number(product.quantity ?? product.stock_quantity ?? 0),
    stock_quantity: Number(product.stock_quantity ?? product.quantity ?? 0),
    salePrice: discount > 0 ? Math.round(price * (1 - discount / 100) * 100) / 100 : null,
    sizes: product.sizes || [],
    colors: product.colors || (product.color ? [{ name: product.color, hex: product.color }] : []),
    details: product.details || (product.description ? [product.description] : []),
    seller: product.seller || product.brand || 'Never Before Cosmetic',
    tag: product.tag || (product.featured ? 'Featured' : product.topSell ? 'Bestseller' : null),
    new: product.new ?? false,
    tags: product.tags || [],
  };
};

export function useProducts() {
  const { content } = useSiteContent();
  const source = content?.product_source === 'database' ? 'database' : 'mock';
  const [products, setProducts] = useState(allProducts);
  const [loading, setLoading] = useState(source === 'database');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (source === 'mock') {
      setProducts(allProducts);
      setLoading(false);
      setError(null);
      return () => { cancelled = true; };
    }

    setLoading(true);
    axios.get(`${backendUrl}/product/products`)
      .then((res) => {
        if (!cancelled) setProducts((res.data?.products || []).map(normalizeProduct));
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError);
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [source]);

  return { products, loading, error, source };
}
