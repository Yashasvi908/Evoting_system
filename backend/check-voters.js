const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkVoters = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await User.countDocuments({ role: 'voter' });
        const allCount = await User.countDocuments();
        console.log(`DATABASE CHECK:`);
        console.log(`Total Users: ${allCount}`);
        console.log(`Voter Role Count: ${count}`);
        
        const latest = await User.find({ role: 'voter' }).limit(5);
        console.log('Latest 5 Voters:', JSON.stringify(latest, null, 2));
        
        process.exit(0);
    } catch (err) { console.error(err); process.exit(1); }
};

checkVoters();
