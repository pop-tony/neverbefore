import productModel from "../models/productsModel.js";
import cloudinary from "../lib/cloudinary.js";
import { logError } from '../utils/logger.js';

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
  description: product.description ?? null,
  price: toNumber(product.price?.toString?.() ?? product.price),
  image_url: product.image_url || product.image || null,
  category: product.category || null,
  stock_quantity: typeof product.stock_quantity === 'number' ? product.stock_quantity : toNumber(product.quantity),
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

    return res.json({ success: true, products: products.map(normalizeProduct) });
  } catch (error) {
    logError('Get products failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to get products' });
  }
}