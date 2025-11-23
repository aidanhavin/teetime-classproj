
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema with fields for name, email, password hash, role, and active status
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    active: { type: Boolean, default: true }, // can be toggled by admin
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Exports the User model based on the userSchema
module.exports = mongoose.model('User', userSchema);
