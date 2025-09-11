// utils/emailService.js
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendTicketEmail = async (email, tickets) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Garba Night 2025',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: '🎭 Your Garba Night 2025 Tickets - Entry QR Codes Inside',
      html: generateTicketEmailHTML(tickets)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

const generateTicketEmailHTML = (tickets) => {
  const ticket = tickets[0];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px; border-radius: 8px; }
        .ticket-info { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .qr-section { text-align: center; margin: 20px 0; padding: 20px; background: white; border-radius: 8px; border: 2px solid #ddd; }
        .qr-code { max-width: 200px; }
        .important { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎭 Garba Night 2025</h1>
        <h2>Your Tickets Are Ready!</h2>
      </div>
      
      <div class="ticket-info">
        <h3>📝 Booking Details</h3>
        <p><strong>Name:</strong> ${ticket.attendeeName}</p>
        <p><strong>Event Date:</strong> October 15, 2025</p>
        <p><strong>Ticket Type:</strong> ${ticket.ticketType.toUpperCase()}</p>
        <p><strong>Quantity:</strong> ${tickets.length} ticket(s)</p>
        <p><strong>Booking ID:</strong> ${ticket.ticketId}</p>
      </div>

      <div class="important">
        <h3>⚠️ Important Instructions</h3>
        <ul>
          <li>Show the QR code on your phone at the entry</li>
          <li>Each QR code is valid for ONE-TIME entry only</li>
          <li>Entry starts at 7:00 PM on event day</li>
          <li>Keep this email safe - it contains your entry tickets</li>
        </ul>
      </div>

      ${tickets.map((ticket, index) => `
        <div class="qr-section">
          <h3>Ticket ${index + 1} - QR Code</h3>
          <img src="${ticket.qrCode}" alt="QR Code" class="qr-code" />
          <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        </div>
      `).join('')}

      <div style="text-align: center; color: #666; margin-top: 30px;">
        <p>Thank you for booking with us! 🙏</p>
        <p>© 2025 Your Event Management Company</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendTicketEmail
};
