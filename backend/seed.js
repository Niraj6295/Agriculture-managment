require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Crop = require('./models/Crop');
const SoilData = require('./models/SoilData');
const { Alert, Irrigation } = require('./models/misc');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Crop.deleteMany({}),
    SoilData.deleteMany({}),
    Alert.deleteMany({}),
    Irrigation.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create Users
  const admin = await User.create({ name: 'Admin User', email: 'admin@agri.com', password: 'admin123', role: 'admin' });
  const farmer = await User.create({ name: 'Ravi Kumar', email: 'farmer@agri.com', password: 'farmer123', role: 'farmer', phone: '+91 98765 43210' });
  const expert = await User.create({ name: 'Dr. Priya Sharma', email: 'expert@agri.com', password: 'expert123', role: 'expert', phone: '+91 87654 32109' });
  console.log('👥 Created users: admin, farmer, expert');

  // Create Crops
  const wheat = await Crop.create({ farmer: farmer._id, name: 'Wheat', variety: 'HD-2967', fieldSize: 5.5, currentStage: 'vegetative', healthStatus: 'healthy', plantingDate: new Date('2024-11-15'), expectedHarvestDate: new Date('2025-04-10'), fieldLocation: { address: 'Field A, Ludhiana', lat: 30.9010, lng: 75.8573 }, notes: 'Main crop this season' });
  const rice = await Crop.create({ farmer: farmer._id, name: 'Rice', variety: 'Pusa Basmati 1121', fieldSize: 3.0, currentStage: 'flowering', healthStatus: 'warning', plantingDate: new Date('2024-06-20'), expectedHarvestDate: new Date('2024-10-30'), fieldLocation: { address: 'Field B, Ludhiana', lat: 30.9050, lng: 75.8600 } });
  const tomato = await Crop.create({ farmer: farmer._id, name: 'Tomato', variety: 'Hybrid', fieldSize: 1.5, currentStage: 'ripening', healthStatus: 'critical', plantingDate: new Date('2024-08-01'), expectedHarvestDate: new Date('2024-11-15'), notes: 'Showing signs of blight' });
  console.log('🌾 Created 3 crops');

  // Soil Data
  await SoilData.insertMany([
    { farmer: farmer._id, crop: wheat._id, ph: 6.8, moisture: 65, nitrogen: 280, phosphorus: 45, potassium: 190, organicMatter: 2.4, temperature: 22, recordedAt: new Date(Date.now() - 86400000 * 2) },
    { farmer: farmer._id, crop: wheat._id, ph: 6.5, moisture: 58, nitrogen: 260, phosphorus: 42, potassium: 175, organicMatter: 2.2, temperature: 24, recordedAt: new Date(Date.now() - 86400000 * 7) },
    { farmer: farmer._id, crop: rice._id, ph: 5.9, moisture: 80, nitrogen: 310, phosphorus: 50, potassium: 200, organicMatter: 3.1, temperature: 28, recordedAt: new Date(Date.now() - 86400000 * 1) },
    { farmer: farmer._id, crop: tomato._id, ph: 7.2, moisture: 45, nitrogen: 220, phosphorus: 38, potassium: 160, organicMatter: 1.8, temperature: 26, recordedAt: new Date() },
  ]);
  console.log('🪨 Created soil data');

  // Irrigation Schedules
  const tomorrow = new Date(Date.now() + 86400000);
  const dayAfter = new Date(Date.now() + 86400000 * 2);
  await Irrigation.insertMany([
    { farmer: farmer._id, crop: wheat._id, scheduledDate: tomorrow, duration: 45, waterAmount: 2000, method: 'drip', status: 'scheduled' },
    { farmer: farmer._id, crop: rice._id, scheduledDate: dayAfter, duration: 60, waterAmount: 3500, method: 'flood', status: 'scheduled' },
    { farmer: farmer._id, crop: wheat._id, scheduledDate: new Date(Date.now() - 86400000), duration: 45, waterAmount: 2000, method: 'drip', status: 'completed' },
  ]);
  console.log('💧 Created irrigation schedules');

  // Alerts
  await Alert.insertMany([
    { user: farmer._id, crop: tomato._id, type: 'disease', severity: 'critical', title: 'Disease Alert: Tomato Blight', message: 'Early blight symptoms detected on your Tomato crop. Immediate treatment recommended.' },
    { user: farmer._id, type: 'weather', severity: 'medium', title: 'Weather Alert: Rain Expected', message: 'Heavy rainfall (25mm+) expected in your area tomorrow. Consider postponing pesticide spraying.' },
    { user: farmer._id, crop: wheat._id, type: 'soil', severity: 'low', title: 'Soil pH Advisory', message: 'Wheat field soil pH is slightly acidic. Consider lime application for better nutrient uptake.' },
    { user: farmer._id, type: 'irrigation', severity: 'low', title: 'Irrigation Reminder', message: 'Irrigation scheduled for tomorrow morning at 6:00 AM for your Wheat field.' },
  ]);
  console.log('🔔 Created alerts');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Admin  → admin@agri.com  / admin123');
  console.log('   Farmer → farmer@agri.com / farmer123');
  console.log('   Expert → expert@agri.com / expert123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
