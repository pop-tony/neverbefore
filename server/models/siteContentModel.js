import mongoose from "mongoose";

const siteCategorySchema = new mongoose.Schema({
  name: { type: String, default: '' },
  image_url: { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const siteContentSchema = new mongoose.Schema({
  key: { type: String, default: 'primary', unique: true, index: true },
  brand_name: { type: String, default: 'Never Before Cosmetics' },
  brand_tagline: { type: String, default: 'Beauty with a premium touch' },
  logo_url: { type: String, default: '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg' },
  hero_badge: { type: String, default: 'Limited Time Offer' },
  hero_title: { type: String, default: 'Get a whopping discount of up to 50%' },
  hero_subtitle: { type: String, default: 'Shop our premium collection of cosmetics and beauty products.' },
  hero_cta_label: { type: String, default: 'Shop Now' },
  hero_cta_href: { type: String, default: '#shop' },
  hero_images: { type: [String], default: [] },
  category_heading: { type: String, default: 'Shop by Category' },
  category_subtitle: { type: String, default: 'Browse the collections the team wants to spotlight.' },
  shop_heading: { type: String, default: 'All Products' },
  shop_subheading: { type: String, default: 'Search and filter the latest catalog.' },
  product_source: { type: String, enum: ['mock', 'database'], default: 'mock' },
  empty_title: { type: String, default: 'No products yet' },
  empty_message: { type: String, default: 'Check back soon for new arrivals!' },
  footer_note: { type: String, default: 'Never Before Cosmetics by Madam Jozy' },
  copyright_prefix: { type: String, default: 'All rights reserved.' },
  contact_heading: { type: String, default: 'Contact Us' },
  contact_note: { type: String, default: 'Reach out for orders, support, or product questions.' },
  support_email: { type: String, default: '' },
  support_phone: { type: String, default: '' },
  navigation_home: { type: String, default: 'Home' },
  navigation_shop: { type: String, default: 'Shop' },
  navigation_cart: { type: String, default: 'Cart' },
  navigation_contact: { type: String, default: 'Contact Us' },
  navigation_categories: { type: String, default: 'Categories' },
  navigation_orders: { type: String, default: 'My Orders' },
  admin_access_title: { type: String, default: 'Access Denied' },
  admin_access_message: { type: String, default: 'You need administrator privileges to access this page.' },
  admin_access_note: { type: String, default: 'Contact Madam Jozy to request admin access.' },
  categories: { type: [siteCategorySchema], default: [] },
}, { timestamps: true });

const siteContentModel = mongoose.models.siteContent || mongoose.model('siteContent', siteContentSchema);

export default siteContentModel;