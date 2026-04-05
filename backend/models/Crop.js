const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    variety: { type: String, trim: true },
    fieldLocation: {
      address: String,
      lat: Number,
      lng: Number,
    },
    fieldSize: { type: Number }, // in acres
    plantingDate: { type: Date },
    expectedHarvestDate: { type: Date },
    currentStage: {
      type: String,
      enum: ['seeding', 'germination', 'vegetative', 'flowering', 'ripening', 'harvested'],
      default: 'seeding',
    },
    healthStatus: {
      type: String,
      enum: ['healthy', 'warning', 'critical'],
      default: 'healthy',
    },
    images: [{ type: String }],
    aiDiseaseAnalysis: [
      {
        imageUrl: String,
        disease: String,
        confidence: Number,
        recommendation: String,
        analyzedAt: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Crop', cropSchema);
