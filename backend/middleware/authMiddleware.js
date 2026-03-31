const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            if (!token || token === 'undefined' || token === 'null') {
                return res.status(401).json({ message: 'Token missing or invalid' });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            
            // EMERGENCY ADMIN BYPASS SUPPORT
            if (decoded.userId === 'admin_123') {
                req.user = { _id: 'admin_123', voterId: 'admin', role: 'admin', name: 'Master Admin (Bypass Mode)' };
            } else {
                req.user = await User.findById(decoded.userId).select('-password');
            }

            if (!req.user) {
                return res.status(401).json({ message: 'User no longer exists' });
            }
            next();

        } catch (error) {
            console.error('🛡️ JWT Error:', error.message);
            res.status(401).json({ message: 'Session malformed or expired' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, adminOnly };
