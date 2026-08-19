import productModel from "../models/productsModel.js";
import cloudinary from "../lib/cloudinary.js";
import { logError, logInfo } from '../utils/logger.js';

const SAMPLE_PRODUCTS = [
  {
    _id: 'sample-product-1',
    name: 'Gold Veil Serum',
    description: 'Brightens and smooths for a luxe dewy finish.',
    price: 245,
    quantity: 18,
    category: 'Skincare',
    brand: 'Never Before',
    color: 'gold',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    featured: true,
    topSell: true,
    discount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'sample-product-2',
    name: 'Velvet Blush Ritual',
    description: 'A soft, buildable blush for a radiant everyday glow.',
    price: 180,
    quantity: 25,
    category: 'Makeup',
    brand: 'Never Before',
    color: 'rose',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
    featured: true,
    topSell: false,
    discount: 8,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'sample-product-3',
    name: 'Essence Body Oil',
    description: 'Nourishes skin with a silky glow and soft finish.',
    price: 210,
    quantity: 12,
    category: 'Body',
    brand: 'Never Before',
    color: 'amber',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
    image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
    featured: false,
    topSell: true,
    discount: 15,
    createdAt: new Date().toISOString(),
  },
];

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toIsoString = (value) => {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return new Date(value).toISOString();
};

const normalizeProduct = (product) => ({
  _id: product._id.toString(),
  id: product._id.toString(),
  name: product.name,
  description: product.description ?? '',
  price: toNumber(product.price?.toString?.() ?? product.price),
  image: product.image || product.image_url || '',
  image_url: product.image_url || product.image || '',
  video: product.video || '',
  quantity: toNumber(product.quantity ?? product.stock_quantity),
  stock_quantity: toNumber(product.stock_quantity ?? product.quantity),
  category: product.category || '',
  brand: product.brand || '',
  color: product.color || '',
  featured: Boolean(product.featured),
  topSell: Boolean(product.topSell),
  discount: toNumber(product.discount),
  created_at: toIsoString(product.createdAt || product.created_at),
  updated_at: toIsoString(product.updatedAt || product.updated_at || product.createdAt || product.created_at),
});

const resolveMediaValue = async (value, resourceType = 'image') => {
  if (!value) return '';
  if (typeof value === 'string' && value.startsWith('data:')) {
    const uploaded = await cloudinary.uploader.upload(value, { resource_type: resourceType });
    return uploaded.secure_url;
  }
  return value;
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, image, image_url, video, quantity, stock_quantity, description, brand, color, category, topSell, featured, discount } = req.body;
    const resolvedQuantity = toNumber(stock_quantity ?? quantity, 0);
    const resolvedPrice = toNumber(price, NaN);

    // Validate required fields
    if (!name || Number.isNaN(resolvedPrice)) {
      return res.status(400).json({ success: false, message: 'Missing Required Details' });
    }

    const resolvedImage = await resolveMediaValue(image_url || image, 'image');
    const resolvedVideo = await resolveMediaValue(video, 'video');

    // Create product
    const product = new productModel({
      name,
      price: resolvedPrice,
      quantity: resolvedQuantity,
      stock_quantity: resolvedQuantity,
      description,
      category,
      brand,
      color,
      image: resolvedImage,
      image_url: resolvedImage,
      video: resolvedVideo,
      topSell: Boolean(topSell),
      featured: Boolean(featured),
      discount: toNumber(discount, 0),
    });
    await product.save();

    return res.json({ success: true, message: "Product successfully added", product: normalizeProduct(product) });
  } catch (error) {
    logError('Create product failed', error, { name, path: req.originalUrl });
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const updateProduct = async (req, res) => {
    
  try {
    const { name, price, productId, productImage, image_url, quantity, stock_quantity, description, brand, color, category, video, topSell, featured, discount } = req.body;
    const resolvedProductId = productId || req.params.id;
    const resolvedQuantity = stock_quantity !== undefined ? toNumber(stock_quantity, 0) : quantity !== undefined ? toNumber(quantity, 0) : undefined;
    const resolvedPrice = price !== undefined ? toNumber(price, NaN) : undefined;

    let updatedProduct, imageUrl, videoUrl;

    if (productImage || image_url) {
      imageUrl = await resolveMediaValue(productImage || image_url, 'image');
    }

    if (video) {
      videoUrl = await resolveMediaValue(video, 'video');
    }

    const updateData = {
      ...(name !== undefined ? { name } : {}),
      ...(resolvedPrice !== undefined && !Number.isNaN(resolvedPrice) ? { price: resolvedPrice } : {}),
      ...(resolvedQuantity !== undefined ? { quantity: resolvedQuantity, stock_quantity: resolvedQuantity } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(brand !== undefined ? { brand } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(imageUrl ? { image: imageUrl, image_url: imageUrl } : {}),
      ...(videoUrl ? { video: videoUrl } : {}),
      ...(topSell !== undefined ? { topSell: Boolean(topSell) } : {}),
      ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
      ...(discount !== undefined ? { discount: toNumber(discount, 0) } : {}),
    };

    updatedProduct = await productModel.findByIdAndUpdate(resolvedProductId,
        updateData,
        { new: true });
    

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product: normalizeProduct(updatedProduct) });
  } catch (error) {
    logError('Update product failed', error, { productId: resolvedProductId, path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to update product' });
  }
}

export const deleteProduct = async (req, res) => {

    const { productId } = req.body
    const resolvedProductId = productId || req.params.id;

  try {
    await productModel.deleteOne({ _id: resolvedProductId });
    return res.json({ success: true, message: "Product Deleted!" });
  } catch (error) {
    logError('Delete product failed', error, { productId: resolvedProductId, path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
}

export const getProductData = async (req, res) => {
  try {
    const { id } = req.params;

    if (id) {
      const product = await productModel.findById(id);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      return res.json({ success: true, product: normalizeProduct(product) });
    }

    const products = await productModel.find();

    if (!products.length) {
      logInfo('Product collection empty, returning fallback sample products', { path: req.originalUrl });
      return res.json({ success: true, products: SAMPLE_PRODUCTS.map(normalizeProduct) });
    }

    return res.json({ success: true, products: products.map(normalizeProduct) });
  } catch (error) {
    logError('Get products failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to get products' });
  }
}