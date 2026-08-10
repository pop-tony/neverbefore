import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getSiteContent, updateSiteContent } from '../controllers/contentController.js';

const contentRouter = express.Router();

contentRouter.get('/site-content', getSiteContent);
contentRouter.put('/site-content', userAuth, updateSiteContent);

export default contentRouter;