const mongoose = require('mongoose');

async function connect() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('MONGO_URI is not defined in env variables');
        process.exit(1);
    }
    
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

module.exports = { connect };
