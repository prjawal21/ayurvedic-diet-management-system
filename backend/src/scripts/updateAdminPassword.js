/**
 * Script to update the admin user's password
 * This will update the existing admin user to use the new credentials:
 * Username: admin
 * Password: admin@adms
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const updateAdminPassword = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        // Find admin user
        const admin = await User.findOne({ username: 'admin' });
        if (!admin) {
            console.log('❌ Admin user not found!');
            console.log('Please run createAdmin.js first to create the admin user.');
            process.exit(1);
        }

        // Update password
        admin.password = 'admin@adms'; // Will be hashed by pre-save hook
        await admin.save();

        console.log('\n✅ Admin password updated successfully!');
        console.log('=====================================');
        console.log('Username: admin');
        console.log('Password: admin@adms');
        console.log('=====================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating admin password:', error.message);
        process.exit(1);
    }
};

updateAdminPassword();
