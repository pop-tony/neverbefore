import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { listUsers, getUser, updateUser, deleteUser, adminStats } from '../controllers/adminController.js';

const adminRouter = express.Router();

// All admin routes require adminAuth
adminRouter.get('/users', adminAuth, listUsers);
adminRouter.get('/users/:id', adminAuth, getUser);
adminRouter.put('/users/:id', adminAuth, updateUser);
adminRouter.delete('/users/:id', adminAuth, deleteUser);

adminRouter.get('/stats', adminAuth, adminStats);

export default adminRouter;
