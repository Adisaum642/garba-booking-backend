const nodemailer = require('nodemailer');       

router.post('/send-tickets-email', async (req, res) => {
    try {
      const { to, customerName, tickets, eventName, eventDate, totalAmount, paymentId } = req.body;
      
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
      const ticketList = tickets.map((ticket, index) => `
        Ticket #${index + 1}:
        - ID: ${ticket.ticketId}
        - Type: ${ticket.ticketType}
        - QR Code: ${ticket.qrCode}
      `).join('\n');
  
      const emailContent = `
        Dear ${customerName},
        
        Thank you for booking ${tickets.length} ticket${tickets.length > 1 ? 's' : ''} for ${eventName}!
        
        Your Tickets:
        ${ticketList}
        
        Event: ${eventName}
        Date: ${eventDate}
        Total Amount: ₹${totalAmount}
        Payment ID: ${paymentId}
        
        Please bring all tickets and a valid ID to the venue.
        
        Best regards,
        Event Team
      `;
  
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: `Your ${eventName} Tickets (${tickets.length} tickets)`,
        text: emailContent
      });
  
      res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
