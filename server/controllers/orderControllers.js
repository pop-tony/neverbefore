import consultModel from "../models/consultationModel.js";
import orderAModel from "../models/orderAModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productsModel.js";
import { logError, logInfo } from '../utils/logger.js';

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

const generateOrderNumber = () => `NB-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`;

const SAMPLE_ORDERS = [
  {
    _id: 'sample-order-1',
    customerName: 'Naa Ama',
    email: 'naa@example.com',
    phone: '+233 240 000 001',
    address: 'East Legon, Accra',
    itemName: 'Gold Veil Serum',
    price: 245,
    quantity: 1,
    total: 245,
    paymentRef: 'NB-1001',
    status: 'paid',
    color: 'gold',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    size: '40ml',
    createdAt: new Date().toISOString(),
    items: [{
      id: 'sample-product-1',
      name: 'Gold Veil Serum',
      price: 245,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
      size: '40ml',
      color: 'gold',
    }],
  },
  {
    _id: 'sample-order-2',
    customerName: 'Kofi Mensah',
    email: 'kofi@example.com',
    phone: '+233 240 000 002',
    address: 'Osu, Accra',
    itemName: 'Essence Body Oil',
    price: 210,
    quantity: 2,
    total: 420,
    paymentRef: 'NB-1002',
    status: 'processing',
    color: 'amber',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
    size: '100ml',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [{
      id: 'sample-product-3',
      name: 'Essence Body Oil',
      price: 210,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
      size: '100ml',
      color: 'amber',
    }],
  },
  {
    _id: 'sample-order-3',
    customerName: 'Adjoa Boateng',
    email: 'adjoa@example.com',
    phone: '+233 240 000 003',
    address: 'Labone, Accra',
    itemName: 'Velvet Blush Ritual',
    price: 180,
    quantity: 1,
    total: 180,
    paymentRef: 'NB-1003',
    status: 'shipped',
    color: 'rose',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
    size: 'Standard',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    items: [{
      id: 'sample-product-2',
      name: 'Velvet Blush Ritual',
      price: 180,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800',
      size: 'Standard',
      color: 'rose',
    }],
  },
];

const SAMPLE_CONSULTS = [
  {
    _id: 'sample-consult-1',
    name: 'Mawusi Ofori',
    email: 'mawusi@example.com',
    phone: '+233 555 111 222',
    message: 'I want to understand which serum is best for combination skin.',
    subject: 'Product consultation',
    orderNumber: 'NB-1001',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'sample-consult-2',
    name: 'Sarah Afriyie',
    email: 'sarah@example.com',
    phone: '+233 555 222 333',
    message: 'Can I get a custom routine for sensitive skin?',
    subject: 'Skin routine inquiry',
    orderNumber: 'NB-1002',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const normalizeOrder = (order) => ({
  _id: order._id.toString(),
  id: order._id.toString(),
  user_id: order.user_id ?? null,
  guest_email: order.guest_email ?? null,
  guest_name: order.guest_name ?? null,
  order_number: order.order_number || order.paymentRef || generateOrderNumber(),
  status: order.status || 'pending',
  total_amount: toNumber(order.total_amount ?? order.total ?? 0),
  shipping_address: order.shipping_address || null,
  notes: order.notes || null,
  order_items: (order.order_items || []).map((item) => ({
    _id: item._id ? item._id.toString() : item.id || '',
    id: item._id ? item._id.toString() : item.id || '',
    product_id: item.product_id || '',
    product_name: item.product_name || '',
    quantity: toNumber(item.quantity, 0),
    unit_price: toNumber(item.unit_price, 0),
    created_at: toIsoString(item.created_at),
    product: item.product || undefined,
  })),
  order_status_history: (order.order_status_history || []).map((entry) => ({
    _id: entry._id ? entry._id.toString() : entry.id || '',
    id: entry._id ? entry._id.toString() : entry.id || '',
    order_id: entry.order_id || order._id.toString(),
    status: entry.status || 'pending',
    note: entry.note || null,
    created_by_email: entry.created_by_email || null,
    created_at: toIsoString(entry.created_at),
  })),
  created_at: toIsoString(order.createdAt || order.created_at),
  updated_at: toIsoString(order.updatedAt || order.updated_at || order.createdAt || order.created_at),
});

const buildLegacyFallbackOrder = (payload, productLookup, user) => {
  const firstItem = payload.items?.[0];
  const firstProduct = firstItem ? productLookup.get(firstItem.product_id) : null;
  const shippingAddress = payload.shipping_address || {};
  const fullName = payload.guest_name || shippingAddress.fullName || user?.full_name || user?.name || 'Customer';
  const email = payload.guest_email || user?.email || '';
  const totalAmount = payload.items.reduce((sum, item) => sum + toNumber(item.unit_price, 0) * toNumber(item.quantity, 0), 0);

  return {
    customerName: fullName,
    itemName: firstProduct?.name || firstItem?.product_id || 'Item',
    address: shippingAddress.address || '',
    price: String(totalAmount),
    phone: shippingAddress.phone || '',
    email,
    quantity: payload.items.reduce((sum, item) => sum + toNumber(item.quantity, 0), 0),
    total: totalAmount,
    total_amount: totalAmount,
    paymentRef: payload.order_number || generateOrderNumber(),
    status: 'pending',
    color: firstProduct?.color || '',
    image: firstProduct?.image_url || firstProduct?.image || '',
    size: '',
    order_number: payload.order_number || generateOrderNumber(),
    user_id: user?.id || payload.user_id || null,
    guest_email: payload.guest_email || null,
    guest_name: payload.guest_name || null,
    shipping_address: payload.shipping_address || null,
    notes: payload.notes || '',
    order_items: payload.items.map((item) => ({
      product_id: item.product_id,
      product_name: productLookup.get(item.product_id)?.name || '',
      quantity: toNumber(item.quantity, 1),
      unit_price: toNumber(item.unit_price, 0),
      created_at: new Date(),
    })),
    order_status_history: [{
      status: 'pending',
      note: 'Order created',
      created_by_email: email || null,
      created_at: new Date(),
    }],
  };
};

export const createOrderA = async (req, res) => {
  try {
    const { name, email, phone, date, time, notes, serviceName, servicePrice } = req.body.formData;
    const clientName = name;
    // Validate required fields
    if (!clientName || !email || !phone || !date || !time || !serviceName || !servicePrice) {
      return res.status(400).json({ success: false, message: 'Missing Required Details' });
    }
    const order = new orderModel({ clientName, email, phone, date, time, notes, serviceName, servicePrice });
    await order.save();

    return res.json({ success: true, message: "Order successfully created", data: order._id });
  } catch (error) {
    logError('Create orderA failed', error, { path: req.originalUrl, email: req.body?.formData?.email });
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const createConsult = async (req, res) => {
  try {
    const { name, email, phone, message, orderNumber, subject } = req.body.formData;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Missing Required Details' });
    }

    if (!orderNumber) {
      const consult = new consultModel({name, email, phone, message, subject});
      await consult.save();
      logInfo('Consult created', { email, path: req.originalUrl, consultId: consult._id.toString() });
      return res.json({ success: true, message: "Inquirery Sent", data: consult._id });
    }else{
      const consult = new consultModel({name, email, phone, message, orderNumber, subject});
      await consult.save();
      logInfo('Consult created with order reference', { email, orderNumber, path: req.originalUrl, consultId: consult._id.toString() });
      return res.json({ success: true, message: "Inquirery Sent", data: consult._id });
    }

  } catch (error) {
    logError('Create consult failed', error, { path: req.originalUrl, email: req.body?.formData?.email });
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const createOrder = async (req, res) => {

  try {
    if (Array.isArray(req.body.items)) {
      const items = req.body.items;
      const shippingAddress = req.body.shipping_address || null;
      const productIds = items.map((item) => item.product_id).filter(Boolean);
      const products = await productModel.find({ _id: { $in: productIds } });
      const productLookup = new Map(products.map((product) => [product._id.toString(), product]));
      const orderPayload = {
        items,
        shipping_address: shippingAddress,
        user_id: req.body.user_id || req.user?.id || null,
        guest_email: req.body.guest_email || null,
        guest_name: req.body.guest_name || null,
        notes: req.body.notes || '',
        order_number: req.body.order_number || generateOrderNumber(),
      };

      if (!items.length || !shippingAddress) {
        return res.status(400).json({ success: false, message: 'Missing Required Details' });
      }

      const order = new orderAModel(buildLegacyFallbackOrder(orderPayload, productLookup, req.user));
      await order.save();

      logInfo('Order created', {
        orderId: order._id.toString(),
        guestEmail: req.body.guest_email || req.user?.email,
        itemCount: items.length,
        total: order.total || 0,
        path: req.originalUrl,
      });

      return res.status(201).json({ success: true, message: "Order successfully created", order: normalizeOrder(order) });
    }

    const legacyOrderData = req.body.orderData;
    const { customer, items, total, paymentRef, status } = legacyOrderData;
    const { name, email, phone, address } = customer;
    const { price, quantity, color, size, image } = items[0];
    const customerName = name;
    const itemName = items[0].name
    
    // Validate required fields
    if (!customerName || !email || !phone || !address || !itemName || !price || !quantity || !total || !paymentRef || !status || !image) {
      return res.status(400).json({ success: false, message: 'Missing Required Details' });
    }
    
    const order = new orderAModel({ customerName, email, phone, address, itemName, price, quantity, total, paymentRef, status, color, size, image });
    await order.save();

    return res.json({ success: true, message: "Order successfully created", data: order });
  } catch (error) {
    logError('Create order failed', error, { path: req.originalUrl, guestEmail: req.body?.guest_email });
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const updateOrder = async (req, res) => {
  let updatedOrder;
  let resolvedOrderId = req.body?.orderId || req.params?.id || null;
  
try {
  const { orderId, status } = req.body;
  resolvedOrderId = orderId || req.params?.id || resolvedOrderId;

  const order = await orderAModel.findById(resolvedOrderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const history = Array.isArray(order.order_status_history) ? order.order_status_history : [];
  history.push({
    status,
    note: `Status updated to ${status}`,
    created_by_email: req.user?.email || null,
    created_at: new Date(),
  });

  updatedOrder = await orderAModel.findByIdAndUpdate(resolvedOrderId,
      { status, order_status_history: history },
      { new: true });
  

  if (!updatedOrder) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  logInfo('Order status updated', {
    orderId: resolvedOrderId,
    status,
    actorId: req.user?.id,
    path: req.originalUrl,
  });

  return res.json({ success: true, order: normalizeOrder(updatedOrder) });
} catch (error) {
  logError('Update order failed', error, { orderId: resolvedOrderId, path: req.originalUrl });
  return res.status(500).json({ success: false, message: 'Failed to update order' });
}
}

export const deleteOrder = async (req, res) => {

    const { orderId } = req.body
    const resolvedOrderId = orderId || req.params.id;

  try {
    await orderModel.deleteOne({ _id: resolvedOrderId });
    logInfo('Order deleted', {
      orderId: resolvedOrderId,
      actorId: req.user?.id,
      path: req.originalUrl,
    });
    return res.json({ success: true, message: "Order Deleted!" });
  } catch (error) {
    logError('Delete order failed', error, { orderId: resolvedOrderId, path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
}

export const getOrderData = async (req, res) => {
  try {
    const user = req.user;
    const filter = !user || user.role === 'admin'
      ? {}
      : { $or: [{ user_id: user.id }, { guest_email: user.email }] };
    const orders = await orderAModel.find(filter);

    if (!orders.length) {
      logInfo('Order collection empty, returning sample order data', { path: req.originalUrl });
      return res.json({ success: true, orders: SAMPLE_ORDERS.map((order) => normalizeOrder(order)) });
    }

    logInfo('Orders fetched', {
      count: orders.length,
      requesterId: req.user?.id,
      role: req.user?.role,
      path: req.originalUrl,
    });

    return res.json({ success: true, orders: orders.map(normalizeOrder) });
  } catch (error) {
    logError('Get orders failed', error, { path: req.originalUrl, userId: req.user?.id });
    return res.status(500).json({ success: false, message: 'Failed to get orders' });
  }
}

export const getOrderDataIndividual = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const orderNumber = req.query.order_number || req.query.orderNumber;
    const email = req.query.email;

    let order = null;

    if (orderId) {
      order = await orderAModel.findById(orderId);
    } else if (orderNumber && email) {
      order = await orderAModel.findOne({
        order_number: orderNumber,
        $or: [{ guest_email: email }, { email }],
      });
    }

    if (!order) {
      logInfo('Order lookup returned no result', { orderId, orderNumber, email, path: req.originalUrl });
      return res.status(404).json({ success: false, message: "No orders found!", order: null });
    }

    logInfo('Order fetched successfully', { orderId: order._id.toString(), path: req.originalUrl });
    return res.json({ success: true, data: normalizeOrder(order), order: normalizeOrder(order) });
  } catch (error) {
    logError('Get individual order failed', error, { orderId, orderNumber, email, path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to get orders' });
  }
}

export const updateConsult = async (req, res) => {
  let updatedConsult;
  
  try {
    const { consultId,status } = req.body;

    updatedConsult = await consultModel.findByIdAndUpdate(consultId,
        { status },
        { new: true });
    

    if (!updatedConsult) {
      return res.json({ success: false, message: 'Consult not found' });
    }

    return res.json({ success: true, consult: updatedConsult });
  } catch (error) {
    logError('Update consult failed', error, { consultId, path: req.originalUrl });
    return res.json({ success: false, message: 'Failed to update Consult' });
  }
}

export const getConsultData = async (req, res) => {
  try {
    const consults = await consultModel.find();

    if (!consults.length) {
      logInfo('Consult list empty, returning sample consult data', { path: req.originalUrl });
      return res.json({ success: true, consults: SAMPLE_CONSULTS });
    }

    logInfo('Consults fetched', { count: consults.length, path: req.originalUrl });
    return res.json({ success: true, consults });
  } catch (error) {
    logError('Get consults failed', error, { path: req.originalUrl });
    return res.json({ success: false, message: 'Failed to get cunsult' });
  }
}

export const deleteConsult = async (req, res) => {

  const { consultId } = req.body

  try {
    await consultModel.deleteOne({ _id: consultId });
    return res.json({ success: true, message: "consult Deleted!" });
  } catch (error) {
    logError('Delete consult failed', error, { consultId, path: req.originalUrl });
    return res.json({ success: false, message: 'Failed to delete consult' });
  }
}