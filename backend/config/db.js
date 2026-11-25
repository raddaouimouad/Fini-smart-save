const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/fini_db';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[FINI] MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[FINI Error] MongoDB Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
