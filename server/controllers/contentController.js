import siteContentModel from '../models/siteContentModel.js';
import cloudinary from '../lib/cloudinary.js';
import { logError } from '../utils/logger.js';

const DEFAULT_KEY = 'primary';
const DEFAULT_DESIGNATED_ADMIN_EMAILS = ['poptonydm@gmail.com'];

const buildDefaultContent = () => ({
  key: DEFAULT_KEY,
  brand_name: 'Never Before Cosmetics',
  brand_tagline: 'Beauty with a premium touch',
  logo_url: '/WhatsApp_Image_2026-07-06_at_12.02.55_PM.jpeg',
  hero_badge: 'Limited Time Offer',
  hero_title: 'Get a whopping discount of up to 50%',
  hero_subtitle: 'Shop our premium collection of cosmetics and beauty products.',
  hero_cta_label: 'Shop Now',
  hero_cta_href: '#shop',
  hero_images: [],
  home_stats_eyebrow: 'Why choose us',
  home_stats_title: 'Beauty routines designed for the modern muse.',
  home_stats: [
    { value: '500', label: 'Clean formulas', icon: 'shield' },
    { value: '2000', label: 'Glow reviews', icon: 'star' },
    { value: '48', label: 'Fast delivery (hours)', icon: 'truck' },
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
  designated_admin_emails: DEFAULT_DESIGNATED_ADMIN_EMAILS,
  categories: [],
});

const resolveMediaValue = async (value, resourceType = 'image') => {
  if (!value) return '';
  if (typeof value === 'string' && value.startsWith('data:')) {
    const uploaded = await cloudinary.uploader.upload(value, { resource_type: resourceType });
    return uploaded.secure_url;
  }
  return value;
};

const resolveMediaList = async (values = []) => {
  const resolved = [];
  for (const value of values) {
    const uploaded = await resolveMediaValue(value, 'image');
    if (uploaded) resolved.push(uploaded);
  }
  return resolved;
};

const normalizeContent = (doc) => {
  const content = {
    ...buildDefaultContent(),
    ...(doc ? (doc.toObject ? doc.toObject() : doc) : {}),
  };

  if (!Array.isArray(content.designated_admin_emails) || !content.designated_admin_emails.length) {
    content.designated_admin_emails = [...DEFAULT_DESIGNATED_ADMIN_EMAILS];
  }

  if (Array.isArray(content.home_stats)) {
    content.home_stats = content.home_stats.map((stat) => ({
      ...stat,
      value: String(stat?.value ?? '').replace(/[^0-9.-]/g, ''),
    }));
  }

  return content;
};

export const getSiteContent = async (req, res) => {
  try {
    let content = await siteContentModel.findOne({ key: DEFAULT_KEY });

    if (!content) {
      content = await siteContentModel.create(buildDefaultContent());
    } else if (!Array.isArray(content.designated_admin_emails) || !content.designated_admin_emails.length) {
      content.designated_admin_emails = [...DEFAULT_DESIGNATED_ADMIN_EMAILS];
      await content.save();
    }

    return res.json({ success: true, content: normalizeContent(content) });
  } catch (error) {
    logError('Get site content failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to load site content' });
  }
};

export const updateSiteContent = async (req, res) => {
  try {
    const existing = await siteContentModel.findOne({ key: DEFAULT_KEY });
    const body = req.body || {};
    const existingDesignatedAdmins = (existing?.designated_admin_emails?.length
      ? existing.designated_admin_emails
      : DEFAULT_DESIGNATED_ADMIN_EMAILS
    ).map((email) => email.trim().toLowerCase());

    if (Object.prototype.hasOwnProperty.call(body, 'designated_admin_emails')) {
      const actorEmail = req.user?.email?.trim().toLowerCase();
      const requestedDesignatedAdmins = Array.isArray(body.designated_admin_emails)
        ? [...new Set(body.designated_admin_emails.map((email) => String(email).trim().toLowerCase()).filter(Boolean))]
        : [];
      const removedEmails = existingDesignatedAdmins.filter((email) => !requestedDesignatedAdmins.includes(email));

      if (!existingDesignatedAdmins.includes(actorEmail)) {
        return res.status(403).json({ success: false, message: 'Only a designated admin can change designated admin access' });
      }

      if (removedEmails.some((email) => email !== actorEmail)) {
        return res.status(403).json({ success: false, message: 'Designated admins can only revoke their own designation' });
      }

      if (!requestedDesignatedAdmins.length) {
        return res.status(400).json({ success: false, message: 'At least one designated admin is required' });
      }

      body.designated_admin_emails = requestedDesignatedAdmins;
    }
    const resolvedLogoUrl = body.logo_url ? await resolveMediaValue(body.logo_url, 'image') : undefined;
    const resolvedHeroImages = Array.isArray(body.hero_images) ? await resolveMediaList(body.hero_images) : undefined;
    const resolvedCategories = Array.isArray(body.categories)
      ? await Promise.all(body.categories.map(async (category) => ({
          ...category,
          image_url: await resolveMediaValue(category?.image_url, 'image'),
        })))
      : undefined;
    const merged = {
      ...buildDefaultContent(),
      ...(existing ? existing.toObject() : {}),
      ...body,
      key: DEFAULT_KEY,
    };

    if (resolvedLogoUrl !== undefined) {
      merged.logo_url = resolvedLogoUrl;
    }

    if (resolvedHeroImages !== undefined) {
      merged.hero_images = resolvedHeroImages;
    }

    if (resolvedCategories !== undefined) {
      merged.categories = resolvedCategories.filter(Boolean);
    }

    const updated = await siteContentModel.findOneAndUpdate(
      { key: DEFAULT_KEY },
      merged,
      { new: true, upsert: true, runValidators: true }
    );

    return res.json({ success: true, content: normalizeContent(updated) });
  } catch (error) {
    logError('Update site content failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to update site content' });
  }
};