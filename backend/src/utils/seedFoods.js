require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('../models/Food');
const connectDB = require('../config/db');

// Sample Indian foods with complete nutritional and Ayurvedic data
const sampleFoods = [
    // Grains
    {
        name: 'Basmati Rice',
        calories: 200,
        protein: 4,
        carbs: 45,
        fat: 0.5,
        rasa: ['Madhura'],
        virya: 'Sheeta',
        digestibility: 'Easy',
        category: 'Grain'
    },
    {
        name: 'Whole Wheat Roti',
        calories: 120,
        protein: 4,
        carbs: 22,
        fat: 2,
        rasa: ['Madhura'],
        virya: 'Ushna',
        digestibility: 'Moderate',
        category: 'Grain'
    },
    {
        name: 'Oats',
        calories: 150,
        protein: 5,
        carbs: 27,
        fat: 3,
        rasa: ['Madhura'],
        virya: 'Sheeta',
        digestibility: 'Easy',
        category: 'Grain'
    },
    // Vegetables
    {
        name: 'Spinach (Palak)',
        calories: 25,
        protein: 3,
        carbs: 4,
        fat: 0.5,
        rasa: ['Kashaya', 'Tikta'],
        virya: 'Sheeta',
        digestibility: 'Easy',
        category: 'Vegetable'
    },
    {
        name: 'Bottle Gourd (Lauki)',
        calories: 15,
        protein: 1,
        carbs: 3,
        fat: 0.2,
        rasa: ['Madhura'],
        virya: 'Sheeta',
        digestibility: 'Easy',
        category: 'Vegetable'
    },
    {
        name: 'Carrot (Gajar)',
        calories: 40,
        protein: 1,
        carbs: 9,
        fat: 0.2,
        rasa: ['Madhura'],
        virya: 'Ushna',
        digestibility: 'Easy',
        category: 'Vegetable'
    },
    {
        name: 'Bitter Gourd (Karela)',
        calories: 20,
        protein: 1,
        carbs: 4,
        fat: 0.2,
        rasa: ['Tikta', 'Katu'],
        virya: 'Sheeta',
        digestibility: 'Moderate',
        category: 'Vegetable'
    },
    {
        name: 'Okra (Bhindi)',
        calories: 35,
        protein: 2,
        carbs: 7,
        fat: 0.2,
        rasa: ['Madhura'],
        virya: 'Ushna',
        digestibility: 'Moderate',
        category: 'Vegetable'
    },
    // Fruits
    {
        name: 'Banana',
        calories: 90,
        protein: 1,
        carbs: 23,
        fat: 0.3,
        rasa: ['Madhura'],
        virya: 'Sheeta',
        digestibility: 'Easy',
        category: 'Fruit'
    },
    {
        name: 'Apple',
        calories: 52,
        protein: 0.3,
        carbs: 14,
        fat: 0.2,
        rasa: ['Madhura', 'Kashaya'],
        virya: 'Sheeta',
        digestibility: 'Easy',
        category: 'Fruit'
    },
    {
        name: 'Mango',
        calories: 60,
        protein: 0.8,
        carbs: 15,
        fat: 0.4,
        rasa: ['Madhura', 'Amla'],
        virya: 'Ushna',
        digestibility: 'Moderate',
        category: 'Fruit'
    },
    // Dairy
    {
        name: 'Cow Milk',
        calories: 60,
        protein: 3,
        carbs: 5,
        fat: 3,
        rasa: ['Madhura'],
        virya: 'Sheeta',
        digestibility: 'Moderate',
        category: 'Dairy'
    },
    {
        name: 'Yogurt (Dahi)',
        calories: 60,
        protein: 3.5,
        carbs: 4.7,
        fat: 3.3,
        rasa: ['Madhura', 'Amla'],
        virya: 'Ushna',
        digestibility: 'Easy',
        category: 'Dairy'
    },
    {
        name: 'Ghee',
        calories: 120,
        protein: 0,
        carbs: 0,
        fat: 14,
        rasa: ['Madhura'],
        virya: 'Sheeta',
        digestibility: 'Easy',
        category: 'Dairy'
    },
    // Legumes
    {
        name: 'Moong Dal',
        calories: 105,
        protein: 7,
        carbs: 19,
        fat: 0.4,
        rasa: ['Madhura', 'Kashaya'],
        virya: 'Sheeta',
        digestibility: 'Easy',
        category: 'Legume'
    },
    {
        name: 'Masoor Dal',
        calories: 115,
        protein: 9,
        carbs: 20,
        fat: 0.4,
        rasa: ['Kashaya', 'Madhura'],
        virya: 'Ushna',
        digestibility: 'Moderate',
        category: 'Legume'
    },
    {
        name: 'Chickpeas (Chana)',
        calories: 165,
        protein: 9,
        carbs: 27,
        fat: 3,
        rasa: ['Madhura', 'Kashaya'],
        virya: 'Sheeta',
        digestibility: 'Heavy',
        category: 'Legume'
    },
    // Spices
    {
        name: 'Ginger',
        calories: 5,
        protein: 0.2,
        carbs: 1,
        fat: 0.1,
        rasa: ['Katu'],
        virya: 'Ushna',
        digestibility: 'Easy',
        category: 'Spice'
    },
    {
        name: 'Turmeric',
        calories: 8,
        protein: 0.3,
        carbs: 1.4,
        fat: 0.3,
        rasa: ['Katu', 'Tikta'],
        virya: 'Ushna',
        digestibility: 'Easy',
        category: 'Spice'
    },
    {
        name: 'Cumin (Jeera)',
        calories: 8,
        protein: 0.4,
        carbs: 0.9,
        fat: 0.5,
        rasa: ['Katu', 'Tikta'],
        virya: 'Ushna',
        digestibility: 'Easy',
        category: 'Spice'
    },
    // Nuts
    {
        name: 'Almonds',
        calories: 160,
        protein: 6,
        carbs: 6,
        fat: 14,
        rasa: ['Madhura'],
        virya: 'Ushna',
        digestibility: 'Heavy',
        category: 'Nut'
    },
    // Beverages
    {
        name: 'Herbal Tea',
        calories: 2,
        protein: 0,
        carbs: 0.5,
        fat: 0,
        rasa: ['Tikta', 'Kashaya'],
        virya: 'Ushna',
        digestibility: 'Easy',
        category: 'Beverage'
    },
    {
        name: 'Buttermilk (Chaas)',
        calories: 40,
        protein: 2,
        carbs: 5,
        fat: 1,
        rasa: ['Madhura', 'Amla'],
        virya: 'Sheeta',
        digestibility: 'Easy',
        category: 'Beverage'
    }
];

const seedFoods = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing foods
        await Food.deleteMany({});
        console.log('Cleared existing foods');

        // Insert sample foods
        await Food.insertMany(sampleFoods);
        console.log(`Successfully seeded ${sampleFoods.length} food items`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding foods:', error);
        process.exit(1);
    }
};

seedFoods();
