const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  attendeeName: {
    type: String,
    required: true
  },
  attendeeEmail: {
    type: String,
    required: true
  },
  attendeePhone: {
    type: String,
    default: ''
  },
  ticketType: {
    type: String,
    required: true,
    enum: ['regular', 'family', 'couple']
  },
  eventDate: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    default: 'Garba Night 2025'
  },
  venue: {
    type: String,
    default: 'PARK PLAZA Hotel,Near Metro Zirakpur Chandigarh Highway zirakpur-140603'
  },
  time: {
    type: String,
    default: '7:00 PM - 11:00 PM'
  },
  paymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'used'],
    default: 'confirmed'
  },
  individualPrice: {
    type: Number,
    default: 500
  },
  ticketNumber: {
    type: Number,
    default: 1
  },
  totalTickets: {
    type: Number,
    default: 1
  },
  qrCode: {
    type: String,
    default: ''
  },
  scannedAt: {
    type: Date,
    default: null
  },
  scannedBy: {
    type: String,
    default: null
  },
  entryAllowed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ scannedAt: 1 });
ticketSchema.index({ attendeeEmail: 1 });
ticketSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
