const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Authenticate user & get token
const loginUser = async (req, res) => {
    const { voterId, password } = req.body;
    console.log(`🔑 Login request for: ${voterId}`);

    // [EMERGENCY BYPASS] Try DB admin first, fallback to mock if DB search fails
    if (voterId === 'admin' && password === 'admin') {
        let dbAdmin = null;
        try {
            dbAdmin = await User.findOne({ voterId: 'admin' });
        } catch (e) {
            console.warn('⚠️ Database not ready for admin lookup, using mock bypass');
        }
        const adminId = dbAdmin ? String(dbAdmin._id) : 'admin_123';
        
        console.log(`✅ Emergency Bypass: Using ${dbAdmin ? 'LIVE' : 'MOCK'} Admin Node`);

        const token = jwt.sign(
            { userId: adminId, role: 'admin' },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '10h' }
        );

        return res.json({
            _id: adminId,
            voterId: 'admin',
            name: dbAdmin ? dbAdmin.name : 'Master Admin (Bypass Mode)',
            role: 'admin',
            token
        });
    }


    // Normal Database Logic
    try {
        const user = await User.findOne({ voterId });

        if (!user) {
            console.warn(`❌ User NOT found: ${voterId}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.isLocked) {
            return res.status(403).json({ message: 'Account locked due to 3 failed attempts. Contact admin.' });
        }

        const isMatch = await user.matchPassword(password);

        if (isMatch) {
            user.loginAttempts = 0;
            await user.save();

            const token = jwt.sign(
                { userId: String(user._id), role: user.role },
                process.env.JWT_SECRET || 'secret123',
                { expiresIn: '1h' }
            );


            res.json({
                _id: user._id,
                voterId: user.voterId,
                name: user.name,
                role: user.role,
                token
            });
        } else {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 3) {
                user.isLocked = true;
            }
            await user.save();

            res.status(401).json({ 
                message: user.isLocked ? 'Account locked after 3 attempts' : 'Invalid credentials',
                attemptsLeft: user.isLocked ? 0 : 3 - user.loginAttempts
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    // [EMERGENCY BYPASS] Profile for emergency admin
    if (req.user && req.user.userId === 'admin_123') {
        return res.json({
            _id: 'admin_123',
            voterId: 'admin',
            name: 'Master Admin (Bypass Mode)',
            role: 'admin'
        });
    }

    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                voterId: user.voterId,
                name: user.name,
                role: user.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { loginUser, getProfile };
