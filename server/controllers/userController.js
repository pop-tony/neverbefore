import userModel from "../models/userModel.js";

const serializeUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    username: user.username || (user.email ? user.email.split('@')[0] : 'user'),
    email: user.email,
    number: user.number,
    isAccountVerified: user.isAccountVerified,
    isAdmin: Boolean(user.isAdmin),
    createdAt: user.createdAt,
});

export const getUserData = async (req, res)=>{
    try {
        const {userId} = req.body

        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        res.json({success: true, userData: serializeUser(user)});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { userId, name, email, number, username } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User session not found' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (email && email !== user.email) {
            const existingUser = await userModel.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }

        const updatedName = typeof name === 'string' && name.trim() ? name.trim() : user.name;
        const updatedEmail = typeof email === 'string' && email.trim() ? email.trim() : user.email;
        const updatedNumber = number !== undefined && number !== null && number !== '' ? Number(number) : user.number;
        const updatedUsername = typeof username === 'string' && username.trim() ? username.trim() : user.username || user.email.split('@')[0];

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                name: updatedName,
                email: updatedEmail,
                number: updatedNumber,
                username: updatedUsername,
            },
            { new: true }
        );

        return res.json({
            success: true,
            message: 'Profile updated successfully',
            user: serializeUser(updatedUser),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
    }
};