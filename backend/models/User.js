const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatar: { type: String, default: '' },
    healthProfile: {
      hasAsthma: { type: Boolean, default: false },
      hasCOPD: { type: Boolean, default: false },
      hasAllergies: { type: Boolean, default: false },
      sensitivityLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
    },
    savedLocations: [
      {
        name: String,
        lat: Number,
        lon: Number
      }
    ],
    alertsEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
