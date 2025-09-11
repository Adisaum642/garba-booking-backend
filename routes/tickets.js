// routes/tickets.js
const express = require('express');
const Ticket = require('../models/Ticket');
const { generateQRCode } = require('../utils/qrGenerator');

const router = express.Router();

// Generate tickets - MATCHES YOUR FRONTEND: /api/generate-tickets
router.post('/generate-tickets', async (req, res) => {
    try {
      const { customerName, customerEmail, ticketType, quantity, paymentId } = req.body;
      
      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        tickets.push({
          ticketId: `GARBA-${Date.now()}-${i + 1}`,
          attendeeName: customerName,
          ticketType: ticketType,
          paymentId: paymentId,
          eventName: 'Garba Night 2025',
          eventDate: '2025-10-15',
          status: 'Confirmed',
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GARBA-${Date.now()}-${i + 1}`
        });
      }
      
      res.json({ success: true, tickets });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  

module.exports = router;
