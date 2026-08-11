const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crispiest-chicken');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // In development, we'll continue without DB and use in-memory data
    console.log('⚠️  Running in demo mode without database');
    return null;
  }
};

module.exports = connectDB;
