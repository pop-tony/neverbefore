import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { createProduct, updateProduct, deleteProduct, getProductData } from '../controllers/productController.js';

const adminProductRouter = express.Router();

// Admin product CRUD
adminProductRouter.post('/products', adminAuth, createProduct);
adminProductRouter.put('/products/:id', adminAuth, updateProduct);
adminProductRouter.delete('/products/:id', adminAuth, deleteProduct);

// Admin product management
adminProductRouter.get('/products', adminAuth, getProductData);
adminProductRouter.get('/products/:id', adminAuth, getProductData);

export default adminProductRouter;
