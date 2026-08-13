import express from 'express';
import { deleteProduct, getProductData } from '../controllers/productController.js';
import { createProduct } from '../controllers/productController.js';
import { updateProduct } from '../controllers/productController.js';
import userAuth from '../middleware/userAuth.js';

const productRouter = express.Router();

productRouter.get('/products', getProductData);
productRouter.get('/products/:id', getProductData);
// Admin-protected product management endpoints
// Public product endpoints (read-only). Admin actions moved to /api/admin/products
productRouter.get('/products', getProductData);
productRouter.get('/products/:id', getProductData);

productRouter.get('/data', getProductData);

export default productRouter;