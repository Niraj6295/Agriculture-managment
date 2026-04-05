const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'farmer', 'expert'], default: 'farmer' },
    phone: { type: String, trim: true },
    location: {
      address: String,
      lat: Number,
      lng: Number,
    },
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    otpCode: { type: String },
    otpExpiry: { type: Date },
    lastLogin: { type: Date },
    activityLogs: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        ip: String,
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.twoFactorSecret;
  delete obj.otpCode;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
