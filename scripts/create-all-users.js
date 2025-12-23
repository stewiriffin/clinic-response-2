// scripts/create-all-users.js
// Creates test users for all roles in the system
// Usage: node scripts/create-all-users.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  fullName: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

const testUsers = [
  {
    email: 'admin@clinic.com',
    password: 'admin123',
    role: 'Admin',
    fullName: 'System Administrator'
  },
  {
    email: 'doctor@clinic.com',
    password: 'doctor123',
    role: 'Doctor',
    fullName: 'Dr. John Smith'
  },
  {
    email: 'nurse@clinic.com',
    password: 'nurse123',
    role: 'Nurse',
    fullName: 'Nurse Sarah Johnson'
  },
  {
    email: 'pharmacist@clinic.com',
    password: 'pharmacist123',
    role: 'Pharmacist',
    fullName: 'Pharmacist Mike Chen'
  },
  {
    email: 'lab@clinic.com',
    password: 'lab123',
    role: 'Lab technician',
    fullName: 'Lab Tech Emily Davis'
  },
  {
    email: 'receptionist@clinic.com',
    password: 'receptionist123',
    role: 'Receptionist',
    fullName: 'Receptionist Anna Williams'
  }
];

async function createAllUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Delete existing test users (optional - comment out if you want to keep existing users)
    console.log('Cleaning up existing test users...');
    await User.deleteMany({
      email: { $in: testUsers.map(u => u.email) }
    });
    console.log('Cleaned up\n');

    console.log('Creating test users...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const userData of testUsers) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = new User({
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        fullName: userData.fullName
      });

      await user.save();

      console.log(`Created: ${userData.role.padEnd(15)} | ${userData.email.padEnd(25)} | Password: ${userData.password}`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nAll users created successfully!\n');
    console.log('You can now login with any of the above credentials to test different roles.\n');
    console.log('IMPORTANT: Change these passwords in production!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAllUsers();
