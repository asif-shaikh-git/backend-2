import User from '../models/User.js';


export const sanitizeUser = (user) => {
    return new User({
        _id: user._id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
    });
};
