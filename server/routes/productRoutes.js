import express from 'express';
import { deleteProduct, getProductData } from '../controllers/productController.js';
import { createProduct } from '../controllers/productController.js';
import { updateProduct } from '../controllers/productController.js';
import userAuth from '../middleware/userAuth.js';

const productRouter = express.Router();

productRouter.get('/products', getProductData);
productRouter.get('/products/:id', getProductData);
productRouter.post('/products', userAuth, createProduct);
productRouter.put('/products/:id', userAuth, updateProduct);
productRouter.delete('/products/:id', userAuth, deleteProduct);

productRouter.get('/data', getProductData);
productRouter.post('/create-product', createProduct);
productRouter.put('/update-product', updateProduct);
productRouter.post('/delete-product', deleteProduct);

export default productRouter;