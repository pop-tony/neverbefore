import express from 'express';
import { createConsult, createOrder, createOrderA, deleteConsult, deleteOrder, getConsultData, getOrderData, getOrderDataIndividual, updateConsult, updateOrder } from '../controllers/orderControllers.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';

const orderRouter = express.Router();

orderRouter.get('/orders', userAuth, getOrderData);
orderRouter.get('/orders/track', getOrderDataIndividual);
orderRouter.post('/orders', createOrder);
orderRouter.put('/orders/:id/status', adminAuth, updateOrder);

orderRouter.get('/data', getOrderData);
orderRouter.get('/i-data', getOrderDataIndividual);
orderRouter.get('/c-data', getConsultData); 
orderRouter.post('/create-order', createOrder);
orderRouter.post('/create-orderA', createOrderA);
orderRouter.post('/consult', createConsult);
orderRouter.put('/update-order', adminAuth, updateOrder);
orderRouter.put('/update-consult', adminAuth, updateConsult);
orderRouter.post('/delete-order', adminAuth, deleteOrder);
orderRouter.post('/delete-consult', adminAuth, deleteConsult);

export default orderRouter;