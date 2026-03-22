/**
 * Script to create the single ADMIN user
 * Username: admin
 * Password: admin@adms
 * 
 * Run this script once to set up the admin account
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Clinic = require('../models/Clinic');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            console.log('Username:', existingAdmin.username);
            console.log('Email:', existingAdmin.email);
            process.exit(0);
        }

        // Find or create a default clinic for admin
        let clinic = await Clinic.findOne();
        if (!clinic) {
            clinic = await Clinic.create({
                name: 'Main Clinic',
                email: 'admin@adms.com',
                phone: '',
                address: '',
                isActive: true
            });
            console.log('✅ Created default clinic');
        }

        // Create admin user
        const admin = await User.create({
            name: 'System Administrator',
            email: 'admin@adms.com',
            username: 'admin',
            password: 'admin@adms', // Will be hashed by pre-save hook
            role: 'ADMIN',
            clinic: clinic._id,
            isActive: true
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('=====================================');
        console.log('Username:', admin.username);
        console.log('Password: admin@adms');
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('Clinic:', clinic.name);
        console.log('=====================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
