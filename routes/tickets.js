// routes/tickets.js
const express = require('express');
const Ticket = require('../models/Ticket');
const { generateQRCode } = require('../utils/qrGenerator');
const router = express.Router();

// Generate tickets - FIXED VERSION that saves to database
router.post('/generate-tickets', async (req, res) => {
  try {
    console.log('🎫 Generating tickets with data:', req.body);
    
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      ticketType, 
      quantity, 
      paymentId, 
      eventDate,
      totalAmount,
      eventName 
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !ticketType || !quantity || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['customerName', 'customerEmail', 'ticketType', 'quantity', 'paymentId']
      });
    }

    const tickets = [];
    const timestamp = Date.now();

    // Create tickets for the specified quantity
    for (let i = 0; i < quantity; i++) {
      const ticketId = `GARBA-${timestamp}-${i + 1}`;
      
      // Create ticket object with all required fields
      const ticketData = {
        ticketId: ticketId,
        attendeeName: customerName,
        attendeeEmail: customerEmail,
        attendeePhone: customerPhone || '', // Optional field
        ticketType: ticketType,
        eventDate: eventDate || '2025-10-15',
        paymentId: paymentId,
        eventName: eventName || 'Garba Night 2025',
        venue: 'PARK PLAZA Hotel,Near Metro Zirakpur Chandigarh Highway zirakpur-140603',
        time: '7:00 PM - 11:00 PM',
        status: 'confirmed', // Fixed: was 'Confirmed', should be 'confirmed'
        individualPrice: totalAmount ? Math.round(totalAmount / quantity) : 500,
        ticketNumber: i + 1,
        totalTickets: quantity
      };

      // Generate QR code data (simple ticket ID format to match your scanner)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketId)}`;
      
      // Add QR code to ticket data
      ticketData.qrCode = qrCodeUrl;

      // 🔥 CRITICAL FIX: Save each ticket to database
      const savedTicket = await Ticket.create(ticketData);
      console.log(`✅ Ticket saved to DB: ${savedTicket.ticketId}`);

      // Add to response array
      tickets.push({
        ticketId: savedTicket.ticketId,
        attendeeName: savedTicket.attendeeName,
        ticketType: savedTicket.ticketType,
        ticketNumber: savedTicket.ticketNumber || (i + 1),
        totalTickets: savedTicket.totalTickets || quantity,
        paymentId: savedTicket.paymentId,
        eventDate: savedTicket.eventDate,
        eventName: savedTicket.eventName,
        individualPrice: savedTicket.individualPrice,
        status: savedTicket.status,
        qrCode: savedTicket.qrCode,
        venue: savedTicket.venue,
        time: savedTicket.time,
        createdAt: savedTicket.createdAt
      });
    }

    console.log(`✅ Successfully generated and saved ${tickets.length} tickets to database`);

    res.json({ 
      success: true, 
      tickets: tickets,
      message: `${tickets.length} tickets generated and saved successfully`
    });

  } catch (error) {
    console.error('❌ Ticket generation failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate tickets',
      error: error.message 
    });
  }
});

// Get all tickets (for debugging)
router.get('/all-tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      totalTickets: tickets.length,
      tickets: tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete all tickets (for testing)
router.delete('/clear-all-tickets', async (req, res) => {
  try {
    const result = await Ticket.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} tickets`);
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} tickets`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
