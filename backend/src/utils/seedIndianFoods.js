const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../../.env' });
const Food = require('../models/Food');

const CURATED_FOODS = [
  // ── BREAKFAST ──
  { name: 'Poha (Flattened Rice)', category: 'Cereal Grains and Pasta', meal_type: 'Breakfast', calories: 130, protein: 2.5, carbs: 27, fat: 0.5, fiber: 0.5, iron: 1.2, calcium: 10, vitaminC: 0, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Upma (Semolina Porridge)', category: 'Cereal Grains and Pasta', meal_type: 'Breakfast', calories: 155, protein: 4, carbs: 28, fat: 3, fiber: 1.5, iron: 1, calcium: 15, vitaminC: 0, dosha_suitable: 'Tridosha', virya: 'Warming', rasa: ['Madhura'], guna: ['Laghu'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Idli (Steamed Rice Cake)', category: 'Cereal Grains and Pasta', meal_type: 'Breakfast', calories: 58, protein: 2, carbs: 12, fat: 0.3, fiber: 0.5, iron: 0.5, calcium: 8, vitaminC: 0, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura'], guna: ['Laghu', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Dosa (Rice Lentil Crepe)', category: 'Cereal Grains and Pasta', meal_type: 'Breakfast', calories: 133, protein: 3.5, carbs: 22, fat: 3.7, fiber: 1, iron: 0.8, calcium: 12, vitaminC: 0, dosha_suitable: 'Tridosha', virya: 'Warming', rasa: ['Amla', 'Madhura'], guna: ['Laghu'], vipaka: 'Amla', agni_level: 'Medium' },
  { name: 'Oatmeal (Cooked)', category: 'Cereal Grains and Pasta', meal_type: 'Breakfast', calories: 71, protein: 2.5, carbs: 12, fat: 1.5, fiber: 1.7, iron: 0.7, calcium: 10, vitaminC: 0, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Wheat Roti (Chapati)', category: 'Cereal Grains and Pasta', meal_type: 'Breakfast', calories: 297, protein: 8, carbs: 52, fat: 6, fiber: 3.9, iron: 2.7, calcium: 30, vitaminC: 0, dosha_suitable: 'Tridosha', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Methi Paratha (Fenugreek Flatbread)', category: 'Cereal Grains and Pasta', meal_type: 'Breakfast', calories: 230, protein: 6, carbs: 35, fat: 7, fiber: 3, iron: 2, calcium: 25, vitaminC: 2, dosha_suitable: 'Kapha', virya: 'Warming', rasa: ['Tikta', 'Katu'], guna: ['Laghu', 'Ruksha'], vipaka: 'Katu', agni_level: 'Medium' },
  { name: 'Besan Chilla (Chickpea Pancake)', category: 'Legumes and Legume Products', meal_type: 'Breakfast', calories: 180, protein: 9, carbs: 24, fat: 5, fiber: 4, iron: 2.5, calcium: 45, vitaminC: 0, dosha_suitable: 'Kapha', virya: 'Warming', rasa: ['Madhura', 'Kashaya'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Sabudana Khichdi (Tapioca Porridge)', category: 'Cereal Grains and Pasta', meal_type: 'Breakfast', calories: 210, protein: 2, carbs: 45, fat: 4, fiber: 0.5, iron: 0.3, calcium: 20, vitaminC: 0, dosha_suitable: 'Vata', virya: 'Cooling', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Boiled Eggs', category: 'Dairy and Egg Products', meal_type: 'Breakfast', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, iron: 1.9, calcium: 50, vitaminC: 0, vitaminD: 87, vitaminB12: 1.1, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },

  // ── LUNCH ──
  { name: 'White Rice (Cooked)', category: 'Cereal Grains and Pasta', meal_type: 'Lunch', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, iron: 0.2, calcium: 10, vitaminC: 0, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura'], guna: ['Laghu', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Brown Rice (Cooked)', category: 'Cereal Grains and Pasta', meal_type: 'Lunch', calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, iron: 0.5, calcium: 10, vitaminC: 0, dosha_suitable: 'Kapha', virya: 'Cooling', rasa: ['Madhura'], guna: ['Guru', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Moong Dal (Yellow Lentil Soup)', category: 'Legumes and Legume Products', meal_type: 'Lunch', calories: 104, protein: 7, carbs: 18, fat: 0.4, fiber: 4, iron: 1.4, calcium: 27, vitaminC: 1, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura', 'Kashaya'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Toor Dal (Pigeon Pea Soup)', category: 'Legumes and Legume Products', meal_type: 'Lunch', calories: 116, protein: 7, carbs: 20, fat: 0.4, fiber: 5, iron: 1.5, calcium: 30, vitaminC: 1, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura', 'Kashaya'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Chana Dal (Split Chickpea Soup)', category: 'Legumes and Legume Products', meal_type: 'Lunch', calories: 164, protein: 8, carbs: 27, fat: 2.7, fiber: 7, iron: 3.5, calcium: 49, vitaminC: 0, dosha_suitable: 'Kapha', virya: 'Cooling', rasa: ['Madhura', 'Kashaya'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Rajma Curry (Kidney Bean Curry)', category: 'Legumes and Legume Products', meal_type: 'Lunch', calories: 127, protein: 8.7, carbs: 22, fat: 0.5, fiber: 6.4, iron: 6.4, calcium: 83, vitaminC: 2, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura', 'Kashaya'], guna: ['Guru', 'Ruksha'], vipaka: 'Madhura', agni_level: 'High' },
  { name: 'Palak Paneer (Spinach Cottage Cheese)', category: 'Dairy and Egg Products', meal_type: 'Lunch', calories: 180, protein: 10, carbs: 8, fat: 12, fiber: 2, iron: 3.5, calcium: 220, vitaminC: 15, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura', 'Tikta'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Aloo Gobi (Potato Cauliflower)', category: 'Vegetables and Vegetable Products', meal_type: 'Lunch', calories: 95, protein: 2.5, carbs: 18, fat: 2.5, fiber: 3, iron: 1, calcium: 30, vitaminC: 48, dosha_suitable: 'Kapha', virya: 'Warming', rasa: ['Madhura', 'Tikta'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Bhindi Masala (Okra Stir Fry)', category: 'Vegetables and Vegetable Products', meal_type: 'Lunch', calories: 78, protein: 2, carbs: 14, fat: 2, fiber: 3.2, iron: 0.8, calcium: 82, vitaminC: 23, dosha_suitable: 'Pitta', virya: 'Cooling', rasa: ['Madhura', 'Tikta'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Lauki Sabzi (Bottle Gourd Stir Fry)', category: 'Vegetables and Vegetable Products', meal_type: 'Lunch', calories: 17, protein: 0.6, carbs: 3.7, fat: 0.1, fiber: 0.5, iron: 0.2, calcium: 26, vitaminC: 10, dosha_suitable: 'Pitta', virya: 'Cooling', rasa: ['Madhura'], guna: ['Laghu', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Mixed Vegetable Curry', category: 'Vegetables and Vegetable Products', meal_type: 'Lunch', calories: 85, protein: 2.5, carbs: 12, fat: 3, fiber: 3.5, iron: 2, calcium: 40, vitaminC: 30, dosha_suitable: 'Tridosha', virya: 'Warming', rasa: ['Madhura', 'Tikta'], guna: ['Laghu'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Kadhi (Yogurt Gram Flour Curry)', category: 'Dairy and Egg Products', meal_type: 'Lunch', calories: 82, protein: 3, carbs: 10, fat: 3, fiber: 1, iron: 0.5, calcium: 90, vitaminC: 0, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Amla', 'Madhura'], guna: ['Laghu', 'Snigdha'], vipaka: 'Amla', agni_level: 'Medium' },
  { name: 'Chicken Curry', category: 'Poultry Products', meal_type: 'Lunch', calories: 165, protein: 18, carbs: 5, fat: 8, fiber: 1, iron: 1.3, calcium: 15, vitaminC: 2, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura', 'Katu'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'High' },
  { name: 'Fish Curry (Rohu)', category: 'Finfish and Shellfish Products', meal_type: 'Lunch', calories: 130, protein: 17, carbs: 3, fat: 6, fiber: 0.5, iron: 1, calcium: 30, vitaminC: 0, vitaminD: 200, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'High' },
  { name: 'Sambar (Lentil Vegetable Stew)', category: 'Legumes and Legume Products', meal_type: 'Lunch', calories: 70, protein: 4, carbs: 12, fat: 1.5, fiber: 3, iron: 2, calcium: 40, vitaminC: 20, dosha_suitable: 'Tridosha', virya: 'Warming', rasa: ['Madhura', 'Amla', 'Katu'], guna: ['Laghu'], vipaka: 'Katu', agni_level: 'Medium' },
  { name: 'Dal Makhani (Black Lentil Curry)', category: 'Legumes and Legume Products', meal_type: 'Lunch', calories: 150, protein: 8, carbs: 20, fat: 5, fiber: 5, iron: 3.2, calcium: 60, vitaminC: 1, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },

  // ── DINNER ──
  { name: 'Khichdi (Rice Lentil Porridge)', category: 'Cereal Grains and Pasta', meal_type: 'Dinner', calories: 124, protein: 5.2, carbs: 22, fat: 2, fiber: 2.5, iron: 1.5, calcium: 25, vitaminC: 0, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura'], guna: ['Laghu', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Moong Dal Soup (Light)', category: 'Legumes and Legume Products', meal_type: 'Dinner', calories: 85, protein: 6, carbs: 14, fat: 0.4, fiber: 3, iron: 1.2, calcium: 25, vitaminC: 0, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Vegetable Soup', category: 'Vegetables and Vegetable Products', meal_type: 'Dinner', calories: 45, protein: 2, carbs: 8, fat: 1, fiber: 2, iron: 1, calcium: 30, vitaminC: 15, dosha_suitable: 'Tridosha', virya: 'Warming', rasa: ['Madhura', 'Tikta'], guna: ['Laghu'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Barley Soup (Yavagu)', category: 'Cereal Grains and Pasta', meal_type: 'Dinner', calories: 95, protein: 3, carbs: 19, fat: 0.5, fiber: 4, iron: 1, calcium: 15, vitaminC: 0, dosha_suitable: 'Kapha', virya: 'Cooling', rasa: ['Madhura', 'Kashaya'], guna: ['Laghu', 'Ruksha'], vipaka: 'Katu', agni_level: 'Low' },
  { name: 'Roti with Ghee', category: 'Cereal Grains and Pasta', meal_type: 'Dinner', calories: 320, protein: 8, carbs: 52, fat: 9, fiber: 3.5, iron: 2.5, calcium: 35, vitaminC: 0, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Palak Soup (Spinach Soup)', category: 'Vegetables and Vegetable Products', meal_type: 'Dinner', calories: 40, protein: 2.5, carbs: 5, fat: 1, fiber: 2, iron: 3, calcium: 100, vitaminC: 28, dosha_suitable: 'Pitta', virya: 'Cooling', rasa: ['Tikta', 'Kashaya'], guna: ['Laghu', 'Ruksha'], vipaka: 'Katu', agni_level: 'Low' },
  { name: 'Grilled Chicken (Tandoori)', category: 'Poultry Products', meal_type: 'Dinner', calories: 150, protein: 25, carbs: 2, fat: 4.5, fiber: 0, iron: 1.5, calcium: 20, vitaminC: 0, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura', 'Katu'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'High' },
  { name: 'Pumpkin Curry (Kaddu)', category: 'Vegetables and Vegetable Products', meal_type: 'Dinner', calories: 50, protein: 1.5, carbs: 10, fat: 1.5, fiber: 1.5, iron: 0.5, calcium: 20, vitaminC: 9, dosha_suitable: 'Pitta', virya: 'Cooling', rasa: ['Madhura'], guna: ['Laghu', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Steamed Vegetables with Rice', category: 'Vegetables and Vegetable Products', meal_type: 'Dinner', calories: 110, protein: 2.5, carbs: 22, fat: 0.5, fiber: 3, iron: 1, calcium: 30, vitaminC: 20, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura', 'Tikta'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Paneer Tikka (Grilled Cottage Cheese)', category: 'Dairy and Egg Products', meal_type: 'Dinner', calories: 265, protein: 15, carbs: 6, fat: 20, fiber: 1, iron: 0.5, calcium: 190, vitaminC: 2, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },

  // ── SNACKS ──
  { name: 'Apple (Fresh)', category: 'Fruits and Fruit Juices', meal_type: 'Snack', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, iron: 0.1, calcium: 6, vitaminC: 5, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura', 'Amla'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Banana (Fresh)', category: 'Fruits and Fruit Juices', meal_type: 'Snack', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, iron: 0.3, calcium: 5, vitaminC: 9, potassium: 358, dosha_suitable: 'Vata', virya: 'Cooling', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Pomegranate (Fresh)', category: 'Fruits and Fruit Juices', meal_type: 'Snack', calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4, iron: 0.3, calcium: 10, vitaminC: 10, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura', 'Amla', 'Kashaya'], guna: ['Laghu', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Papaya (Fresh)', category: 'Fruits and Fruit Juices', meal_type: 'Snack', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, iron: 0.3, calcium: 20, vitaminC: 62, dosha_suitable: 'Kapha', virya: 'Warming', rasa: ['Madhura'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Guava (Fresh)', category: 'Fruits and Fruit Juices', meal_type: 'Snack', calories: 68, protein: 2.6, carbs: 14, fat: 1, fiber: 5.4, iron: 0.3, calcium: 18, vitaminC: 228, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Madhura', 'Amla'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Mango (Fresh)', category: 'Fruits and Fruit Juices', meal_type: 'Snack', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, iron: 0.2, calcium: 11, vitaminC: 36, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura', 'Amla'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Amla (Indian Gooseberry)', category: 'Fruits and Fruit Juices', meal_type: 'Snack', calories: 44, protein: 0.9, carbs: 10, fat: 0.6, fiber: 4.3, iron: 0.3, calcium: 25, vitaminC: 600, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Amla', 'Madhura', 'Tikta', 'Kashaya', 'Katu'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Soaked Almonds', category: 'Nut and Seed Products', meal_type: 'Snack', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, iron: 3.7, calcium: 264, vitaminC: 0, magnesium: 270, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Walnuts (Soaked)', category: 'Nut and Seed Products', meal_type: 'Snack', calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, iron: 2.9, calcium: 98, vitaminC: 1, omega3: 9080, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Kashaya', 'Tikta'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Cashews (Unsalted)', category: 'Nut and Seed Products', meal_type: 'Snack', calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3, iron: 6.7, calcium: 37, vitaminC: 0, magnesium: 292, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Medium' },
  { name: 'Cucumber (Fresh)', category: 'Vegetables and Vegetable Products', meal_type: 'Snack', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, iron: 0.3, calcium: 16, vitaminC: 3, dosha_suitable: 'Pitta', virya: 'Cooling', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Buttermilk (Takra)', category: 'Dairy and Egg Products', meal_type: 'Snack', calories: 40, protein: 3.3, carbs: 4.8, fat: 0.9, fiber: 0, iron: 0.1, calcium: 116, vitaminC: 0, vitaminB12: 0.2, dosha_suitable: 'Tridosha', virya: 'Cooling', rasa: ['Amla', 'Madhura'], guna: ['Laghu', 'Ruksha'], vipaka: 'Amla', agni_level: 'Low' },
  { name: 'Dates (Fresh)', category: 'Fruits and Fruit Juices', meal_type: 'Snack', calories: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7, iron: 1, calcium: 64, vitaminC: 0, potassium: 696, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },

  // ── ALL MEALS (sides and staples) ──
  { name: 'Cow Milk (Full Fat)', category: 'Dairy and Egg Products', meal_type: 'All', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, iron: 0.1, calcium: 113, vitaminC: 0, vitaminD: 40, vitaminB12: 0.4, dosha_suitable: 'Vata', virya: 'Cooling', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Curd (Yogurt, Fresh)', category: 'Dairy and Egg Products', meal_type: 'All', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, iron: 0.1, calcium: 121, vitaminC: 0, vitaminB12: 0.4, dosha_suitable: 'Vata', virya: 'Warming', rasa: ['Amla', 'Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Amla', agni_level: 'Medium' },
  { name: 'Spinach (Palak, Cooked)', category: 'Vegetables and Vegetable Products', meal_type: 'All', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, iron: 3.6, calcium: 136, vitaminC: 28, dosha_suitable: 'Pitta', virya: 'Cooling', rasa: ['Tikta', 'Kashaya'], guna: ['Laghu', 'Ruksha'], vipaka: 'Katu', agni_level: 'Low' },
  { name: 'Pumpkin (Cooked)', category: 'Vegetables and Vegetable Products', meal_type: 'All', calories: 20, protein: 0.7, carbs: 5, fat: 0.1, fiber: 0.5, iron: 0.4, calcium: 15, vitaminC: 9, dosha_suitable: 'Pitta', virya: 'Cooling', rasa: ['Madhura'], guna: ['Laghu', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Carrot (Cooked)', category: 'Vegetables and Vegetable Products', meal_type: 'All', calories: 35, protein: 0.8, carbs: 8, fat: 0.2, fiber: 3, iron: 0.4, calcium: 33, vitaminC: 6, dosha_suitable: 'Tridosha', virya: 'Warming', rasa: ['Madhura', 'Tikta'], guna: ['Laghu', 'Ruksha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Turmeric Milk (Haldi Doodh)', category: 'Dairy and Egg Products', meal_type: 'All', calories: 70, protein: 3.5, carbs: 6, fat: 3.5, fiber: 0.2, iron: 0.5, calcium: 120, vitaminC: 0, dosha_suitable: 'Tridosha', virya: 'Warming', rasa: ['Madhura', 'Tikta', 'Katu'], guna: ['Laghu', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Coconut Chutney', category: 'Vegetables and Vegetable Products', meal_type: 'All', calories: 180, protein: 2, carbs: 8, fat: 16, fiber: 4, iron: 1, calcium: 14, vitaminC: 3, dosha_suitable: 'Pitta', virya: 'Cooling', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
  { name: 'Beetroot (Cooked)', category: 'Vegetables and Vegetable Products', meal_type: 'All', calories: 44, protein: 1.7, carbs: 10, fat: 0.2, fiber: 2, iron: 0.8, calcium: 16, vitaminC: 4, folate: 80, dosha_suitable: 'Pitta', virya: 'Cooling', rasa: ['Madhura'], guna: ['Guru', 'Snigdha'], vipaka: 'Madhura', agni_level: 'Low' },
];

async function seedIndianFoods() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Disable isClinicApproved on all existing foods
        await Food.updateMany(
            { source: { $ne: 'Curated' } },
            { $set: { isClinicApproved: false } }
        );
        console.log('✅ Disabled isClinicApproved on all non-curated foods');

        // Upsert new curated foods
        const upserts = CURATED_FOODS.map(food => {
            const newFood = {
                ...food,
                isClinicApproved: true,
                source: 'Curated',
                portionSize: 100,
                glycemic_index: 0
            };
            return Food.findOneAndUpdate(
                { name: food.name },
                { $set: newFood },
                { upsert: true, new: true }
            );
        });

        await Promise.all(upserts);
        console.log(`✅ Upserted ${upserts.length} curated Indian foods`);

        // Get summaries
        const totalCount = await Food.countDocuments();
        const usdaCount = await Food.countDocuments({ source: 'USDA SR Legacy 2018' });
        const curatedCount = await Food.countDocuments({ source: 'Curated' });
        const approvedCount = await Food.countDocuments({ isClinicApproved: true });

        console.log('\n=== DB Summary ===');
        console.log(`Total foods in DB (all): ${totalCount}`);
        console.log(`USDA foods (source = USDA SR Legacy 2018): ${usdaCount}`);
        console.log(`Curated Indian foods (source = Curated): ${curatedCount}`);
        console.log(`isClinicApproved = true: ${approvedCount}`);
        console.log('==================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedIndianFoods();
