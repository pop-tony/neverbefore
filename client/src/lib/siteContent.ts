import { useEffect, useState } from 'react';
import { contentApi, type SiteContent } from './api';

const DEFAULT_CATEGORY_IMAGE = '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  _id: '',
  key: 'primary',
  brand_name: 'Never Before Cosmetics',
  brand_tagline: 'Beauty with a premium touch',
  logo_url: '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg',
  hero_badge: 'Limited Time Offer',
  hero_title: 'Get a whopping discount of up to 50%',
  hero_subtitle: 'Shop our premium collection of cosmetics and beauty products.',
  hero_cta_label: 'Shop Now',
  hero_cta_href: '#shop',
  hero_images: [],
  category_heading: 'Shop by Category',
  category_subtitle: 'Browse the collections the team wants to spotlight.',
  shop_heading: 'All Products',
  shop_subheading: 'Search and filter the latest catalog.',
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
  categories: [],
};

export const normalizeSiteContent = (content?: Partial<SiteContent> | null): SiteContent => ({
  ...DEFAULT_SITE_CONTENT,
  ...(content ?? {}),
  hero_images: content?.hero_images?.filter(Boolean) ?? DEFAULT_SITE_CONTENT.hero_images,
  categories: content?.categories?.filter(Boolean) ?? DEFAULT_SITE_CONTENT.categories,
});

export const getCategoryImage = (content: SiteContent, category: string) => {
  return content.categories.find((item) => item.name === category)?.image_url || content.hero_images[0] || DEFAULT_CATEGORY_IMAGE;
};

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    contentApi.get().then((data) => {
      if (active && data) {
        setContent(normalizeSiteContent(data));
      }
    }).catch(() => {
      if (active) {
        setContent(DEFAULT_SITE_CONTENT);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return {
    content,
    loading,
    refresh: async () => {
      const data = await contentApi.get();
      if (data) setContent(normalizeSiteContent(data));
    },
  };
}