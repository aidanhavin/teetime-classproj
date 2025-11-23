const mongoose = require('mongoose');

// Define the Booking schema with fields for user reference, course, tee date/time, players, price, status, and notes
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: String,
      default: 'Kings Course',
    },
    teeDate: {
      type: String, // format - 'YYYY-MM-DD'
      required: true,
    },
    teeTime: {
      type: String, // format - 'HH:MM' 
      required: true,
    },
    players: {
      type: Number,
      min: 1,
      max: 4,
      default: 1,
    },
    pricePerPlayer: {
      type: Number,   // default - 46.00
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);
// Creates a compound index to ensure uniqueness of tee time slots for a given course and date
bookingSchema.index({ teeDate: 1, teeTime: 1, course: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

