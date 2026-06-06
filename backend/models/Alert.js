const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['pm25', 'pm10', 'aqi', 'ozone', 'co2'], default: 'aqi' },
    threshold: { type: Number, required: true },
    location: {
      name: String,
      lat: Number,
      lon: Number
    },
    message: { type: String },
    isActive: { type: Boolean, default: true },
    triggered: { type: Boolean, default: false },
    triggeredAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
