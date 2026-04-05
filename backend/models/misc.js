const mongoose = require('mongoose');

// Weather Data
const weatherDataSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      address: String,
      lat: Number,
      lng: Number,
    },
    temperature: { type: Number },
    feelsLike: { type: Number },
    humidity: { type: Number },
    windSpeed: { type: Number },
    rainfall: { type: Number },
    condition: { type: String },
    icon: { type: String },
    forecast: [
      {
        date: Date,
        temp: Number,
        condition: String,
        rainfall: Number,
        humidity: Number,
      },
    ],
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Irrigation Schedule
const irrigationSchema = new mongoose.Schema(
  {
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number }, // minutes
    waterAmount: { type: Number }, // liters
    method: { type: String, enum: ['drip', 'sprinkler', 'flood', 'furrow'], default: 'drip' },
    status: { type: String, enum: ['scheduled', 'completed', 'skipped'], default: 'scheduled' },
    aiRecommended: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

// Alert
const alertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    type: {
      type: String,
      enum: ['disease', 'weather', 'irrigation', 'soil', 'pest', 'system'],
      required: true,
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// AI Log
const aiLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['chatbot', 'disease_detection', 'soil_analysis', 'crop_suggestion'], required: true },
    input: { type: String },
    output: { type: String },
    model: { type: String },
    tokensUsed: { type: Number },
    cropContext: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  },
  { timestamps: true }
);

module.exports = {
  WeatherData: mongoose.model('WeatherData', weatherDataSchema),
  Irrigation: mongoose.model('Irrigation', irrigationSchema),
  Alert: mongoose.model('Alert', alertSchema),
  AILog: mongoose.model('AILog', aiLogSchema),
};
