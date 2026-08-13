import jwt from 'jsonwebtoken';
import { logError, logInfo } from '../utils/logger.js';

// Admin middleware: verify JWT and ensure isAdmin
const adminAuth = async (req, res, next) => {
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    logInfo('Admin auth failed: missing token', { method: req.method, path: req.originalUrl });
    return res.status(401).json({ success: false, message: 'Not Authorized' });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDecode?.id) {
      logInfo('Admin auth failed: invalid token payload', { method: req.method, path: req.originalUrl });
      return res.status(401).json({ success: false, message: 'Not Authorized' });
    }

    const isAdmin = Boolean(tokenDecode.isAdmin || tokenDecode.role === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.body = { ...req.body, userId: tokenDecode.id };
    req.user = {
      id: tokenDecode.id,
      email: tokenDecode.email || null,
      full_name: tokenDecode.full_name || tokenDecode.name || '',
      role: tokenDecode.role || (isAdmin ? 'admin' : 'customer'),
      isAdmin,
    };

    next();
  } catch (error) {
    logError('Admin authentication failed', error, { method: req.method, path: req.originalUrl });
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default adminAuth;
