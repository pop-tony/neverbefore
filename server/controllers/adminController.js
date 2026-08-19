import userModel from '../models/userModel.js';
import productModel from '../models/productsModel.js';
import orderAModel from '../models/orderAModel.js';
import siteContentModel from '../models/siteContentModel.js';
import { logError, logInfo } from '../utils/logger.js';

const DEFAULT_DESIGNATED_ADMIN_EMAILS = ['poptonydm@gmail.com'];

const isDesignatedAdmin = async (email) => {
  const content = await siteContentModel.findOne({ key: 'primary' }).select('designated_admin_emails').lean();
  const designatedEmails = content?.designated_admin_emails?.length
    ? content.designated_admin_emails
    : DEFAULT_DESIGNATED_ADMIN_EMAILS;
  return designatedEmails.some((designatedEmail) => designatedEmail.trim().toLowerCase() === email?.trim().toLowerCase());
};

const SAMPLE_USERS = [
  {
    _id: 'sample-admin-1',
    name: 'Madam Jozy',
    email: 'admin@neverbeforecosmetics.com',
    isAdmin: true,
    number: '+233 200 000 000',
  },
  {
    _id: 'sample-user-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    isAdmin: false,
    number: '+233 550 111 222',
  },
];

export const listUsers = async (req, res) => {
  try {
    const users = await userModel.find().select('-password');

    if (!users.length) {
      logInfo('No users found in database, returning sample admin data', { path: req.originalUrl });
      return res.json({ success: true, users: SAMPLE_USERS });
    }

    logInfo('Admin listed users', {
      count: users.length,
      actorId: req.user?.id,
      path: req.originalUrl,
    });
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
    logInfo('Admin fetched single user', {
      userId: req.params.id,
      actorId: req.user?.id,
      path: req.originalUrl,
    });
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

    if (Object.prototype.hasOwnProperty.call(update, 'isAdmin')) {
      if (!(await isDesignatedAdmin(req.user?.email))) {
        logInfo('Admin role change denied', {
          actorId: req.user?.id,
          targetUserId: req.params.id,
          path: req.originalUrl,
        });
        return res.status(403).json({ success: false, message: 'Only the designated admin can grant or revoke admin access' });
      }
    }

    const user = await userModel.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    logInfo('Admin updated user', {
      userId: req.params.id,
      actorId: req.user?.id,
      updateKeys: Object.keys(update),
      path: req.originalUrl,
    });
    return res.json({ success: true, user });
  } catch (error) {
    logError('Update user failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!(await isDesignatedAdmin(req.user?.email))) {
      logInfo('User deletion denied', {
        actorId: req.user?.id,
        targetUserId: req.params.id,
        path: req.originalUrl,
      });
      return res.status(403).json({ success: false, message: 'Only the designated admin can delete users' });
    }

    await userModel.deleteOne({ _id: req.params.id });
    logInfo('Admin deleted user', {
      userId: req.params.id,
      actorId: req.user?.id,
      path: req.originalUrl,
    });
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
    const resolvedUsersCount = usersCount || SAMPLE_USERS.length;
    const resolvedProductsCount = productsCount || 3;
    const resolvedOrdersCount = ordersCount || 3;

    logInfo('Admin stats requested', {
      usersCount: resolvedUsersCount,
      productsCount: resolvedProductsCount,
      ordersCount: resolvedOrdersCount,
      actorId: req.user?.id,
      path: req.originalUrl,
    });
    return res.json({ success: true, stats: { usersCount: resolvedUsersCount, productsCount: resolvedProductsCount, ordersCount: resolvedOrdersCount } });
  } catch (error) {
    logError('Admin stats failed', error, { path: req.originalUrl });
    return res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
};
