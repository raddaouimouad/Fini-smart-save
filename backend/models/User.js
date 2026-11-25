const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Le nom complet est requis'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "L'adresse email est requise"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Format email invalide'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'merchant'],
    default: 'user',
  },
  coinsBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: 'Casablanca',
  },
  notificationPreferences: {
    savingsReminders: { type: Boolean, default: true },
    rewardAlerts: { type: Boolean, default: true },
    gamingUpdates: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
  },
  language: {
    type: String,
    enum: ['fr', 'ar', 'en'],
    default: 'fr',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
