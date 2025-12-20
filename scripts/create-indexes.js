// scripts/create-indexes.js
// Run this script to ensure all database indexes are created
// Usage: node scripts/create-indexes.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function createIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // ========================================
    // USER INDEXES
    // ========================================
    console.log('\n📋 Creating User indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ isBanned: 1 });
    console.log('✅ User indexes created');

    // ========================================
    // PATIENT INDEXES
    // ========================================
    console.log('\n📋 Creating Patient indexes...');
    await db.collection('patients').createIndex({ phone: 1 });
    await db.collection('patients').createIndex({ email: 1 }, { sparse: true });
    await db.collection('patients').createIndex({ fullName: 'text' });
    console.log('✅ Patient indexes created');

    // ========================================
    // APPOINTMENT INDEXES (CRITICAL)
    // ========================================
    console.log('\n📋 Creating Appointment indexes (CRITICAL)...');
    await db.collection('appointments').createIndex({ queueNumber: 1 });
    await db.collection('appointments').createIndex({ status: 1 });
    await db.collection('appointments').createIndex({ patient: 1 });
    await db.collection('appointments').createIndex({ createdAt: -1 });

    // Compound indexes (most important for performance)
    await db.collection('appointments').createIndex({ status: 1, createdAt: -1 });
    await db.collection('appointments').createIndex({ status: 1, queueNumber: 1 });
    await db.collection('appointments').createIndex({ dispensed: 1, status: 1 });
    await db.collection('appointments').createIndex({ readyForDoctor: 1, status: 1 });
    await db.collection('appointments').createIndex({ patient: 1, status: 1 });
    console.log('✅ Appointment indexes created');

    // ========================================
    // LAB TEST INDEXES
    // ========================================
    console.log('\n📋 Creating Lab Test indexes...');
    await db.collection('labtests').createIndex({ status: 1 });
    await db.collection('labtests').createIndex({ createdAt: -1 });
    await db.collection('labtests').createIndex({ patientName: 1 });
    await db.collection('labtests').createIndex({ testType: 1 });
    await db.collection('labtests').createIndex({ status: 1, createdAt: -1 });
    console.log('✅ Lab Test indexes created');

    // ========================================
    // LIST ALL INDEXES
    // ========================================
    console.log('\n📊 Index Summary:');
    const collections = ['users', 'patients', 'appointments', 'labtests'];

    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`\n${collectionName.toUpperCase()}:`);
      indexes.forEach((idx) => {
        console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
    }

    console.log('\n✅ All indexes created successfully!');
    console.log('💡 These indexes will dramatically improve query performance');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
    process.exit(0);
  }
}

createIndexes();
