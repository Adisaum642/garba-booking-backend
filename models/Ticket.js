// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  attendeeName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  ticketType: {
    type: String,
    enum: ['regular', 'vip', 'couple'],
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  totalAmount: {
    type: Number,
    required: true
  },
  qrCode: {
    type: String,
    required: true
  },
  qrData: {
    type: Object,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  paymentId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  checkedInAt: {
    type: Date
  },
  checkedInBy: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ email: 1 });
ticketSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
