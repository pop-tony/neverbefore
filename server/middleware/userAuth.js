import jwt from "jsonwebtoken";
import { logError, logInfo } from '../utils/logger.js';

const userAuth = async (req, res, next)=>{
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = cookieToken || bearerToken;

    if(!token){
        logInfo('Authentication failed: missing token', {
            method: req.method,
            path: req.originalUrl,
        });
        return res.status(401).json({success: false, message: 'Not Authorized. Try Again'});
    }

    try{

        const tokenDecode  = jwt.verify(token, process.env.JWT_SECRET);

        if(tokenDecode.id){
            req.body = { ...req.body, userId: tokenDecode.id };
            req.user = {
                id: tokenDecode.id,
                email: tokenDecode.email || null,
                full_name: tokenDecode.full_name || tokenDecode.name || '',
                role: tokenDecode.role || (tokenDecode.isAdmin ? 'admin' : 'customer'),
                isAdmin: Boolean(tokenDecode.isAdmin || tokenDecode.role === 'admin'),
            };
            
        }else{
            logInfo('Authentication failed: invalid token payload', {
                method: req.method,
                path: req.originalUrl,
            });
            return res.status(401).json({success: false, message: 'Not Authorized. Try Again'});
        }

        next();

    }catch(error){
        logError('Authentication failed', error, {
            method: req.method,
            path: req.originalUrl,
        });
        return res.status(401).json({success: false, message: error.message});
    }
}

export default userAuth;