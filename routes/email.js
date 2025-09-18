const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Add your company logo as base64 string here
const COMPANY_LOGO_BASE64 = 'https://orange-petal.vercel.app/assets/logo.png'; // Replace with your actual logo base64

// Configure Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server ready to send messages');
  }
});

// Email sending route with company logo
router.post('/send-tickets-email', async (req, res) => {
  try {
    console.log('📧 Email API called with data:', JSON.stringify(req.body, null, 2));
    
    const { to, customerName, tickets, eventName, eventDate, totalAmount, paymentId } = req.body;
    
    // Validate required fields
    if (!to || !customerName || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
      console.error('❌ Missing required email data:', { to: !!to, customerName: !!customerName, tickets: !!tickets });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to, customerName, or tickets array' 
      });
    }

    // Create beautiful HTML email template with logo
    const createEmailHTML = (tickets, customerName, totalAmount) => {
      const ticketRows = tickets.map((ticket, index) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 15px; text-align: center; font-weight: bold; color: #667eea;">
            #${index + 1}
          </td>
          <td style="padding: 15px; font-family: monospace; font-size: 12px;">
            ${ticket.ticketId}
          </td>
          <td style="padding: 15px; text-transform: capitalize; color: #333;">
            ${ticket.ticketType} Pass
          </td>
          <td style="padding: 15px; text-align: center;">
            <img src="${ticket.qrCode}" alt="QR Code" style="width: 60px; height: 60px; border: 1px solid #ddd;" />
          </td>
          <td style="padding: 15px; text-align: center; color: #4CAF50; font-weight: bold;">
            ✅ Confirmed
          </td>
        </tr>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your Garba Night 2025 Tickets</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px 20px; }
            .logo-section { background: white; text-align: center; padding: 20px; border-bottom: 3px solid #667eea; }
            .content { padding: 30px 20px; }
            .ticket-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .ticket-table th { background-color: #667eea; color: white; padding: 12px; text-align: left; }
            .ticket-table td { padding: 12px; border-bottom: 1px solid #eee; }
            .info-box { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
            .footer { background-color: #333; color: white; text-align: center; padding: 20px; font-size: 14px; }
            .footer-logo { margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Company Logo Section -->
            <div class="logo-section">
              <img src="${COMPANY_LOGO_BASE64}" alt="Orange Petal Events" style="max-width: 200px; max-height: 80px; object-fit: contain;" />
              <h3 style="margin: 10px 0 0 0; color: #FF8E53; font-size: 18px;">Orange Petal Events</h3>
            </div>

            <!-- Header -->
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎭 Garba Night 2025 🎭</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your Booking Confirmation</p>
            </div>

            <!-- Content -->
            <div class="content">
              <h2 style="color: #667eea; margin-bottom: 20px;">Dear ${customerName},</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                🎉 <strong>Congratulations!</strong> Your booking for Garba Night 2025 has been confirmed successfully!
              </p>

              <!-- Event Details -->
              <div class="info-box">
                <h3 style="color: #667eea; margin-top: 0;">📅 Event Details</h3>
                <p><strong>Event:</strong> ${eventName}</p>
                <p><strong>Date:</strong> September 27, 2025</p>
                <p><strong>Time:</strong> 7:00 PM - 11:00 PM</p>
                <p><strong>Venue:</strong> PARK PLAZA Hotel,Near
Metro Zirakpur
Chandigarh Highway
zirakpur-140603</p>
                <p><strong>Total Amount Paid:</strong> ₹${totalAmount}</p>
                <p><strong>Payment ID:</strong> ${paymentId}</p>
              </div>

              <!-- Tickets Table -->
              <h3 style="color: #667eea;">🎫 Your Tickets (${tickets.length} ticket${tickets.length > 1 ? 's' : ''})</h3>
              <table class="ticket-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ticket ID</th>
                    <th>Type</th>
                    <th>QR Code</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketRows}
                </tbody>
              </table>

              <!-- Important Instructions -->
              <div class="info-box">
                <h3 style="color: #e74c3c; margin-top: 0;">⚠️ Important Instructions</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>📱 <strong>Save this email</strong> - Show it at the venue for entry</li>
                  <li>🆔 <strong>Bring valid photo ID</strong> along with your tickets</li>
                  <li>🚪 <strong>Entry gates open at 6:00 PM</strong></li>
                  <li>📱 <strong>Scan QR codes</strong> for quick entry at the venue</li>
                  <li>🚫 <strong>No outside food/beverages</strong> are allowed</li>
                  <li>👕 <strong>Traditional attire recommended</strong> for the best experience</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                <h4 style="color: #667eea; margin-top: 0;">Need Help?</h4>
                <p style="margin: 5px 0;">📧 Email: info.upasana@orangepetal.in</p>
                <p style="margin: 5px 0;">🌐 Website: https://orangepetal.in</p>
                <p style="margin: 5px 0;">📞 Phone: +91-8920742226</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 18px; color: #667eea; font-weight: bold;">
                  Thank you for choosing Orange Petal Events! 🙏<br>
                  See you at Garba Night 2025! 💃🕺
                </p>
              </div>
            </div>

            <!-- Footer with Logo -->
            <div class="footer">
              <div class="footer-logo">
                <img src="${COMPANY_LOGO_BASE64}" alt="Orange Petal Events" style="max-width: 100px; max-height: 40px; object-fit: contain; opacity: 0.8;" />
              </div>
              <p style="margin: 0;">© 2025 Orange Petal Events. All rights reserved.</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">
                This is an automated email. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    // Email options
    const mailOptions = {
      from: `"Orange Petal Events - Garba Night 2025" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `🎭 Your Garba Night 2025 Tickets - ${tickets.length} Ticket${tickets.length > 1 ? 's' : ''} Confirmed! 🎉`,
      html: createEmailHTML(tickets, customerName, totalAmount),
      // Also include plain text version
      text: `
Dear ${customerName},

Orange Petal Events - Garba Night 2025

Congratulations! Your booking for Garba Night 2025 has been confirmed.

Event Details:
- Event: ${eventName}
- Date: September 27, 2025
- Time: 7:00 PM - 11:00 PM
- Venue: PARK PLAZA Hotel,Near
Metro Zirakpur
Chandigarh Highway
zirakpur-140603
- Total Amount: ₹${totalAmount}
- Payment ID: ${paymentId}

Your Tickets:
${tickets.map((ticket, index) => `
Ticket #${index + 1}:
- Ticket ID: ${ticket.ticketId}
- Type: ${ticket.ticketType} Pass
- Status: Confirmed
- QR Code: ${ticket.qrCode}
`).join('')}

Important Instructions:
• Save this email and show it at the venue
• Bring valid photo ID
• Entry gates open at 6:00 PM
• Scan QR codes for entry

Contact us:
Email: info.upasana@orangepetal.in
Phone: +91 89207 42226
Website: https://orangepetal.in

Thank you for choosing Orange Petal Events!
See you at Garba Night 2025! 🎭

© 2025 Orange Petal Events. All rights reserved.
      `
    };

    // Send the email
    console.log('📤 Sending email to:', to);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    
    res.json({ 
      success: true, 
      message: `Tickets successfully sent to ${to}`,
      messageId: info.messageId,
      ticketsCount: tickets.length
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to send email: ${error.message}`,
      error: error.toString()
    });
  }
});

module.exports = router;

