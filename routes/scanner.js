const express = require('express');
const Ticket = require('../models/Ticket');
const router = express.Router();

// Enhanced QR Code validation - handles both JSON and direct ticket ID
router.post('/validate-qr', async (req, res) => {
  try {
    console.log('🔍 QR Validation request:', req.body);
    
    const { qrData, scannedBy } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required',
        status: 'INVALID_QR'
      });
    }

    console.log('📱 Raw QR Data:', qrData);

    let ticketId = null;
    let ticketInfo = {};
    
    // Handle different QR code formats
    if (qrData.match(/^GARBA-\d+-\d+$/)) {
      // Direct ticket ID format (like your current QR codes)
      console.log('✅ Direct ticket ID format detected');
      ticketId = qrData;
      ticketInfo = {
        ticketId: ticketId,
        event: 'Garba Night 2025',
        format: 'direct_id'
      };
    } else {
      // Try JSON format
      try {
        ticketInfo = JSON.parse(qrData);
        ticketId = ticketInfo.ticketId;
        console.log('✅ JSON format detected and parsed');
      } catch (jsonError) {
        console.log('❌ JSON parsing failed, trying URL decode...');
        
        try {
          // Try URL-encoded JSON
          const decoded = decodeURIComponent(qrData);
          ticketInfo = JSON.parse(decoded);
          ticketId = ticketInfo.ticketId;
          console.log('✅ URL-encoded JSON format detected');
        } catch (decodeError) {
          return res.status(400).json({
            success: false,
            message: 'Invalid QR code format - not a valid ticket',
            status: 'INVALID_FORMAT',
            debug: {
              originalData: qrData,
              expectedFormats: ['GARBA-XXXXXXXXX-X', '{"ticketId":"GARBA-..."}'],
              receivedFormat: typeof qrData === 'string' ? 'string' : typeof qrData
            }
          });
        }
      }
    }

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID not found in QR code',
        status: 'INVALID_QR',
        debug: { parsedData: ticketInfo }
      });
    }

    console.log('🎫 Looking up ticket:', ticketId);

    // Find ticket in database
    const ticket = await Ticket.findOne({ ticketId: ticketId });

    if (!ticket) {
      // Check if any tickets exist at all (for debugging)
      const totalTickets = await Ticket.countDocuments();
      console.log(`❌ Ticket ${ticketId} not found. Total tickets in DB: ${totalTickets}`);
      
      // Show some example ticket IDs if available
      const sampleTickets = await Ticket.find({}).limit(3).select('ticketId');
      
      return res.status(404).json({
        success: false,
        message: 'Ticket not found in system',
        status: 'TICKET_NOT_FOUND',
        debug: {
          searchedTicketId: ticketId,
          totalTicketsInDatabase: totalTickets,
          sampleTicketIds: sampleTickets.map(t => t.ticketId),
          suggestion: totalTickets === 0 ? 'No tickets in database. Create some tickets first.' : 'Ticket ID does not match any in database.'
        }
      });
    }

    console.log('✅ Ticket found:', {
      id: ticket.ticketId,
      name: ticket.attendeeName,
      status: ticket.status
    });

    // Check if ticket is cancelled
    if (ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This ticket has been cancelled',
        status: 'TICKET_CANCELLED',
        ticket: {
          ticketId: ticket.ticketId,
          attendeeName: ticket.attendeeName,
          ticketType: ticket.ticketType
        }
      });
    }

    // Check if ticket is already scanned/used
    if (ticket.status === 'used' && ticket.scannedAt) {
      return res.status(409).json({
        success: false,
        message: 'Ticket already scanned and used for entry',
        status: 'ALREADY_SCANNED',
        ticket: {
          ticketId: ticket.ticketId,
          attendeeName: ticket.attendeeName,
          ticketType: ticket.ticketType,
          scannedAt: ticket.scannedAt,
          scannedBy: ticket.scannedBy
        },
        scannedDetails: {
          originalScanTime: ticket.scannedAt,
          originalScanner: ticket.scannedBy,
          timeSinceFirstScan: new Date() - ticket.scannedAt
        }
      });
    }

    // Valid ticket - Mark as used and allow entry
    ticket.status = 'used';
    ticket.scannedAt = new Date();
    ticket.scannedBy = scannedBy || 'Scanner';
    ticket.entryAllowed = true;

    await ticket.save();

    console.log(`✅ Entry granted: ${ticket.ticketId} - ${ticket.attendeeName}`);

    return res.json({
      success: true,
      message: 'Entry granted! Welcome to Garba Night 2025!',
      status: 'ENTRY_GRANTED',
      ticket: {
        ticketId: ticket.ticketId,
        attendeeName: ticket.attendeeName,
        ticketType: ticket.ticketType,
        scannedAt: ticket.scannedAt,
        scannedBy: ticket.scannedBy
      },
      entryDetails: {
        eventName: 'Garba Night 2025',
        venue: 'PARK PLAZA Hotel,Near Metro Zirakpur Chandigarh Highway zirakpur-140603',
        entryTime: ticket.scannedAt
      }
    });

  } catch (error) {
    console.error('❌ QR validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during validation',
      status: 'SERVER_ERROR',
      error: error.message
    });
  }
});

// Get scanning statistics
router.get('/scan-stats', async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const scannedTickets = await Ticket.countDocuments({ status: 'used' });
    const pendingTickets = await Ticket.countDocuments({ status: 'confirmed' });
    
    const recentScans = await Ticket.find({ status: 'used' })
      .sort({ scannedAt: -1 })
      .limit(10)
      .select('ticketId attendeeName ticketType scannedAt scannedBy');

    res.json({
      success: true,
      stats: {
        totalTickets,
        scannedTickets,
        pendingTickets,
        scanRate: totalTickets > 0 ? ((scannedTickets / totalTickets) * 100).toFixed(1) : 0
      },
      recentScans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manual entry override
router.post('/manual-entry', async (req, res) => {
  try {
    const { ticketId, reason, authorizedBy } = req.body;

    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found',
        debug: { searchedTicketId: ticketId }
      });
    }

    ticket.status = 'used';
    ticket.scannedAt = new Date();
    ticket.scannedBy = `Manual Override - ${authorizedBy}`;
    ticket.entryAllowed = true;

    await ticket.save();

    console.log(`🔓 Manual entry granted: ${ticketId} - Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Manual entry granted',
      ticket: {
        ticketId: ticket.ticketId,
        attendeeName: ticket.attendeeName,
        reason,
        authorizedBy
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.get('/list-tickets', async (req, res) => {
    try {
      const tickets = await Ticket.find({}).select('ticketId attendeeName ticketType status createdAt');
      
      res.json({
        success: true,
        totalTickets: tickets.length,
        tickets: tickets.map(t => ({
          ticketId: t.ticketId,
          attendeeName: t.attendeeName,
          ticketType: t.ticketType,
          status: t.status,
          createdAt: t.createdAt
        }))
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  

  // Add this route to your routes/scanner.js temporarily
router.post('/create-specific-ticket', async (req, res) => {
    try {
      const { ticketId } = req.body;
      
      const testTicket = {
        ticketId: ticketId || 'GARBA-1757866591224-1',
        attendeeName: 'Test User',
        attendeeEmail: 'test@example.com',
        attendeePhone: '+1234567890',
        ticketType: 'regular',
        eventDate: '2025-10-15',
        paymentId: 'test_payment_003',
        eventName: 'Garba Night 2025',
        venue: 'PARK PLAZA Hotel,Near Metro Zirakpur Chandigarh Highway zirakpur-140603',
        time: '7:00 PM - 11:00 PM',
        status: 'confirmed',
        individualPrice: 500
      };
  
      // Check if ticket already exists
      const existingTicket = await Ticket.findOne({ ticketId: testTicket.ticketId });
      if (existingTicket) {
        return res.json({
          success: true,
          message: 'Ticket already exists',
          ticket: existingTicket
        });
      }
  
      const createdTicket = await Ticket.create(testTicket);
      
      console.log(`✅ Created ticket: ${createdTicket.ticketId}`);
      
      res.json({
        success: true,
        message: 'Ticket created successfully',
        ticket: {
          ticketId: createdTicket.ticketId,
          attendeeName: createdTicket.attendeeName,
          ticketType: createdTicket.ticketType,
          status: createdTicket.status
        }
      });
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
module.exports = router;
