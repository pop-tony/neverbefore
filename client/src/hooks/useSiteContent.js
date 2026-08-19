import { useEffect, useState } from 'react';
import axios from 'axios';
import logo from '../assets/logo.jpeg';

const SITE_CONTENT_CACHE_KEY = 'neverbefore_site_content';
let cachedContent = null;
let fetchPromise = null;
let hasFetchedOnce = false;
const listeners = new Set();

export const defaultSiteContent = {
  key: 'primary',
  brand_name: 'Never Before Cosmetics',
  brand_tagline: 'Beauty with a premium touch',
  logo_url: logo,
  hero_badge: 'Limited Time Offer',
  hero_title: 'Get a whopping discount of up to 50%',
  hero_subtitle: 'Shop our premium collection of cosmetics and beauty products.',
  hero_cta_label: 'Shop Now',
  hero_cta_href: '/shop',
  hero_images: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600',
  ],
  category_heading: 'Shop by Category',
  category_subtitle: 'Browse the collections the team wants to spotlight.',
  shop_heading: 'All Products',
  shop_subheading: 'Search and filter the latest catalog.',
  product_source: 'mock',
  empty_title: 'No products yet',
  empty_message: 'Check back soon for new arrivals!',
  footer_note: 'Never Before Cosmetics by Madam Jozy',
  copyright_prefix: 'All rights reserved.',
  contact_heading: 'Contact Us',
  contact_note: 'Reach out for orders, support, or product questions.',
  support_email: '',
  support_phone: '',
  navigation_home: 'Home',
  navigation_shop: 'Shop',
  navigation_cart: 'Cart',
  navigation_contact: 'Contact Us',
  navigation_categories: 'Categories',
  navigation_orders: 'My Orders',
  admin_access_title: 'Access Denied',
  admin_access_message: 'You need administrator privileges to access this page.',
  admin_access_note: 'Contact Madam Jozy to request admin access.',
  designated_admin_emails: ['poptonydm@gmail.com'],
  categories: [],
};

export function getCachedSiteContent() {
  if (cachedContent) return cachedContent;

  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(SITE_CONTENT_CACHE_KEY);
      if (stored) {
        cachedContent = { ...defaultSiteContent, ...JSON.parse(stored) };
        return cachedContent;
      }
    } catch (error) {
      console.warn('Unable to read cached site content', error);
    }
  }

  cachedContent = defaultSiteContent;
  return cachedContent;
}

export function setSiteContentCache(nextContent) {
  const merged = { ...defaultSiteContent, ...(nextContent || {}) };
  cachedContent = merged;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SITE_CONTENT_CACHE_KEY, JSON.stringify(merged));
  }

  listeners.forEach(listener => listener(merged));
  return merged;
}

export async function refreshSiteContent() {
  if (fetchPromise) return fetchPromise;

  const configuredBase = (import.meta.env.VITE_BACKEND_URL || '/api').replace(/\/+$/, '');
  const backendUrl = configuredBase.endsWith('/api') ? configuredBase : `${configuredBase}/api`;

  fetchPromise = axios.get(`${backendUrl}/content/site-content`, { withCredentials: true })
    .then((res) => {
      const nextContent = res.data?.content ? { ...defaultSiteContent, ...res.data.content } : getCachedSiteContent();
      setSiteContentCache(nextContent);
      hasFetchedOnce = true;
      return nextContent;
    })
    .catch((error) => {
      console.warn('Site content unavailable, using cached data.', error);
      const fallback = getCachedSiteContent();
      setSiteContentCache(fallback);
      return fallback;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function useSiteContent() {
  const [content, setContent] = useState(() => getCachedSiteContent());
  const [loading, setLoading] = useState(!hasFetchedOnce);

  useEffect(() => {
    const handleContentUpdate = (nextContent) => setContent(nextContent);
    listeners.add(handleContentUpdate);
    setContent(getCachedSiteContent());

    if (!hasFetchedOnce) {
      setLoading(true);
      refreshSiteContent().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => {
      listeners.delete(handleContentUpdate);
    };
  }, []);

  return { content, loading, refresh: refreshSiteContent };
}
