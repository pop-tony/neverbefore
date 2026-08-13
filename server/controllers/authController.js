import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from '../config/emailTemplates.js';
import { logError, logInfo } from '../utils/logger.js';

const buildUserResponse = (user) => ({
    id: user._id.toString(),
    email: user.email,
    full_name: user.name,
    role: user.isAdmin ? 'admin' : 'customer',
    isAdmin: Boolean(user.isAdmin),
});

const buildToken = (user) => jwt.sign(
    {
        id: user._id.toString(),
        email: user.email,
        full_name: user.name,
        role: user.isAdmin ? 'admin' : 'customer',
        isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

//Register user
export const register = async (req, res)=>{

    const {name, full_name, email, password, number, phone} = req.body;
    const resolvedName = name || full_name;
    const resolvedNumber = number || phone;

    if(!resolvedName || !email || !password || !resolvedNumber){
        return res.status(400).json({success: false, message: 'Missing Details'})
    }
    try{
        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.status(400).json({ success: false, message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({name: resolvedName, email, number: resolvedNumber, password: hashedPassword});
        await user.save();

        const token = buildToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to toKenPop',
            html: WELCOME_EMAIL_TEMPLATE.replace("{{user.name}}", user.name)
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true, token, user: buildUserResponse(user)});

    }catch(error){
        res.status(500).json({success: false, message: error.message});
    }
}

//Log in user
export const login = async (req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({success: false, message: 'Email and Password required'});
    }

    try{

        const user = await userModel.findOne({email});

        if(!user){
            return res.status(401).json({success: false, message: 'Incorrect Password Or Username'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({success: false, message: 'Incorrect Password Or Username'});
        }

        const token = buildToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success: true, token, user: buildUserResponse(user)});

    }catch(error){
        logError('Login failed', error, { email, path: req.originalUrl });
        res.status(500).json({success: false, message: error.message});
    }
}

//Log out user
export const logout = async (req, res)=>{
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success: true, message: 'Logged Out'});

    }catch(error){
        logError('Logout failed', error, { path: req.originalUrl });
        res.status(500).json({success: false, message: error.message});
    }
}

//Send verification OTP to user's mail
export const sendVerifyOtp = async (req, res)=>{
    try{

        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({success: false, message: "Account Already Verified"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOption);

        res.json({success: true, message: 'Verification OTP sent on Email'});

    }catch(error){
        logError('Send verification OTP failed', error, { userId, path: req.originalUrl });
        res.json({success: false, message: error.message});
    }
} 

//Verify user
export const verifyEmail = async (req, res)=>{

    const { otp, userId } = req.body;

    if(!userId || !otp){
        return res.json({success: false, message: 'Missing Details'});
    }

    try{
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP expired'});
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({success: true, message: 'Email Verified'});

    }catch(error){
        logError('Verify email failed', error, { userId, path: req.originalUrl });
        return res.json({success: false, message: error.message});
    }
}

//Check if user is authenticated
export const isAuthenticated = async (req, res)=>{

    try {
        return res.json({ success: true, message: 'Loggedin', user: req.user || null });
    } catch (error) {
        logError('Auth check failed', error, { path: req.originalUrl });
        return res.status(500).json({success: false, message: error.message});
    }
}

// Send password reset OTP
export const sendResetOtp = async (req, res)=>{
    const {email} = req.body;

    if(!email){
        return res.status(400).json({success: false, message: 'Email is required'})
    }

    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOption);

        return res.json({success: true, message: 'OTP sent to your email'})

    } catch (error) {
        logError('Send reset OTP failed', error, { email, path: req.originalUrl });
        return res.status(500).json({success: false, message: error.message});
    }
}

//Reset user password
export const resetPassword = async (req, res)=>{
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.status(400).json({success: false, message: 'All fields required'});
    }

    try {
        
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success: true, message: 'Password Successfully Updated'});

    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
}