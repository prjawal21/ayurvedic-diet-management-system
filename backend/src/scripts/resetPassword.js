require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetPassword = async () => {
    try {
        // Connect to MongoDB
        if (!process.env.MONGODB_URI) {
            console.error('❌ Error: MONGODB_URI not found in environment variables');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Get email from command line argument
        const email = process.argv[2];
        const newPassword = process.argv[3] || 'password123';

        if (!email) {
            console.log('Usage: npm run reset-password <email> [new-password]');
            console.log('Example: npm run reset-password admin@gmail.com myNewPass123\n');
            console.log('Available users:');
            const users = await User.find().select('email name');
            users.forEach(user => {
                console.log(`  - ${user.email} (${user.name})`);
            });
            process.exit(1);
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.error(`❌ User not found: ${email}\n`);
            console.log('Available users:');
            const users = await User.find().select('email name');
            users.forEach(u => {
                console.log(`  - ${u.email} (${u.name})`);
            });
            process.exit(1);
        }

        // Update password
        user.password = newPassword;
        await user.save();

        console.log('✅ Password reset successfully!\n');
        console.log('Login credentials:');
        console.log(`  Email: ${email}`);
        console.log(`  Password: ${newPassword}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

resetPassword();
