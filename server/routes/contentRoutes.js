import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import { getSiteContent, updateSiteContent } from '../controllers/contentController.js';

const contentRouter = express.Router();

contentRouter.get('/site-content', getSiteContent);
// Only admins can update site content
contentRouter.put('/site-content', adminAuth, updateSiteContent);

export default contentRouter;