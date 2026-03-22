/**
 * Phase 1 Migration Script
 * 
 * Migrates existing MVP data to Phase 1 architecture:
 * - Creates default clinic
 * - Assigns all users to clinic with DOCTOR role
 * - Assigns all patients to clinic
 * - Creates visits for existing diet charts
 * - Updates diet charts with visit, version, and clinic references
 * 
 * Implements Rule 5: Each existing diet chart = one visit (valid for MVP only)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Clinic = require('../models/Clinic');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const DietChart = require('../models/DietChart');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for migration');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const runMigration = async () => {
    try {
        console.log('Starting Phase 1 migration...\n');

        // Step 1: Create default clinic (implements Rule 1)
        console.log('Step 1: Creating default clinic...');
        let defaultClinic = await Clinic.findOne();

        if (!defaultClinic) {
            defaultClinic = await Clinic.create({
                name: 'Main Clinic',
                address: 'Migrated from MVP',
                email: '',
                phone: '',
                isActive: true
            });
            console.log(`✓ Created default clinic: ${defaultClinic.name} (ID: ${defaultClinic._id})`);
        } else {
            console.log(`✓ Default clinic already exists: ${defaultClinic.name} (ID: ${defaultClinic._id})`);
        }

        // Step 2: Update all users
        console.log('\nStep 2: Updating users...');
        const users = await User.find({});
        console.log(`Found ${users.length} users to migrate`);

        let updatedUsers = 0;
        for (const user of users) {
            // Only update if clinic is not set
            if (!user.clinic) {
                user.clinic = defaultClinic._id;
                user.role = user.role || 'DOCTOR';  // All MVP users were doctors
                user.isActive = true;
                await user.save();
                updatedUsers++;
            }
        }
        console.log(`✓ Updated ${updatedUsers} users with clinic association and role`);

        // Step 3: Update all patients
        console.log('\nStep 3: Updating patients...');
        const patients = await Patient.find({});
        console.log(`Found ${patients.length} patients to migrate`);

        let updatedPatients = 0;
        for (const patient of patients) {
            // Only update if clinic is not set
            if (!patient.clinic) {
                patient.clinic = defaultClinic._id;
                await patient.save();
                updatedPatients++;
            }
        }
        console.log(`✓ Updated ${updatedPatients} patients with clinic association`);

        // Step 4: Process diet charts (implements Rule 5)
        console.log('\nStep 4: Processing diet charts and creating visits...');
        const dietCharts = await DietChart.find({});
        console.log(`Found ${dietCharts.length} diet charts to migrate`);

        let createdVisits = 0;
        let updatedDietCharts = 0;

        for (const dietChart of dietCharts) {
            // Only process if visit is not set
            if (!dietChart.visit) {
                // Create one visit per diet chart (MVP assumption - Rule 5)
                const visit = await Visit.create({
                    patient: dietChart.patient,
                    clinic: defaultClinic._id,
                    conductedBy: dietChart.createdBy,
                    visitDate: dietChart.createdAt,  // Use diet chart creation date
                    chiefComplaint: 'Migrated from MVP',
                    notes: 'Auto-created during Phase 1 migration. Original diet chart had no visit context.'
                });
                createdVisits++;

                // Update diet chart with visit reference (implements Rule 2)
                dietChart.visit = visit._id;
                dietChart.clinic = defaultClinic._id;
                dietChart.version = 1;
                dietChart.isActive = true;
                await dietChart.save();
                updatedDietCharts++;
            }
        }

        console.log(`✓ Created ${createdVisits} visits`);
        console.log(`✓ Updated ${updatedDietCharts} diet charts with visit, version, and clinic`);

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('Migration Summary:');
        console.log('='.repeat(50));
        console.log(`Clinic: ${defaultClinic.name} (${defaultClinic._id})`);
        console.log(`Users migrated: ${updatedUsers}`);
        console.log(`Patients migrated: ${updatedPatients}`);
        console.log(`Visits created: ${createdVisits}`);
        console.log(`Diet charts migrated: ${updatedDietCharts}`);
        console.log('='.repeat(50));
        console.log('\n✓ Phase 1 migration completed successfully!');

    } catch (error) {
        console.error('\n✗ Migration failed:', error);
        throw error;
    }
};

const main = async () => {
    await connectDB();
    await runMigration();
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
};

// Run migration
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
