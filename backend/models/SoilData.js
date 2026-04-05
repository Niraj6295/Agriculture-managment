const mongoose = require('mongoose');

const soilDataSchema = new mongoose.Schema(
  {
    crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ph: { type: Number, min: 0, max: 14 },
    moisture: { type: Number, min: 0, max: 100 }, // percentage
    nitrogen: { type: Number }, // mg/kg
    phosphorus: { type: Number },
    potassium: { type: Number },
    organicMatter: { type: Number }, // percentage
    temperature: { type: Number }, // Celsius
    electricalConductivity: { type: Number },
    recordedAt: { type: Date, default: Date.now },
    location: {
      lat: Number,
      lng: Number,
    },
    aiRecommendation: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SoilData', soilDataSchema);
