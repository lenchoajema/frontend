const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: 'https://via.placeholder.com/150' },
  role: { type: String, enum: ['admin', 'seller', 'customer'], default: 'customer' },
  // GDPR Compliance fields
  cookieConsent: { type: Object, default: {} },
  marketingConsent: { type: Boolean, default: false },
  dataProcessingConsent: { type: Boolean, default: true },
  deletionRequested: { type: Boolean, default: false },
  deletionRequestedAt: { type: Date },
  deletionScheduledFor: { type: Date },
  isActive: { type: Boolean, default: true },
  // 2FA fields
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword) throw new Error('Entered password is undefined');
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!enteredPassword) throw new Error('Entered password is undefined');
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
