// Quick test to verify MongoDB connection
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;

  console.log('Testing MongoDB connection...');
  console.log('URI (password hidden):', uri.replace(/:[^:@]+@/, ':****@'));

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('SUCCESS! Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);

    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('FAILED to connect');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testConnection();
