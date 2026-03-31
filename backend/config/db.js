const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // mongoose.set('bufferCommands', false); // Removed to prevent error when DB is slow

        console.log(`📡 ATTEMPTING CLOUD HANDSHAKE...`);

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Fast fail if DB not found
        });

        console.log(`✅ CLOUD NODE ACTIVE: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ DATABASE OFFLINE: ${error.message}`);
        console.log('⚠️  SERVER RUNNING WITHOUT DATABASE - Check Internet or Mongo URI');
    }
};

module.exports = connectDB;
