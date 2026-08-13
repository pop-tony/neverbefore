import userModel from '../models/userModel.js';
import productModel from '../models/productsModel.js';
import orderAModel from '../models/orderAModel.js';
import { logError } from '../utils/logger.js';

export const listUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password');
    return res.json({ success: true, users });
  } catch (error) {
    logError('List users failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to list users' });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    logError('Get user failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to get user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.password) delete update.password; // don't allow password change here
    const user = await userModel.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    logError('Update user failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userModel.deleteOne({ _id: req.params.id });
    return res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    logError('Delete user failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

export const adminStats = async (req, res) => {
  try {
    const usersCount = await userModel.countDocuments();
    const productsCount = await productModel.countDocuments();
    const ordersCount = await orderAModel.countDocuments();
    return res.json({ success: true, stats: { usersCount, productsCount, ordersCount } });
  } catch (error) {
    logError('Admin stats failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
};
