// utils/qrGenerator.js
const QRCode = require('qrcode');

const generateQRCode = async (ticketData) => {
  try {
    // Create QR code data with security measures
    const qrCodeData = {
      ticketId: ticketData.ticketId,
      attendeeName: ticketData.attendeeName,
      eventDate: ticketData.eventDate,
      ticketType: ticketData.ticketType,
      eventName: ticketData.eventName || 'Garba Night 2025',
      timestamp: ticketData.timestamp || new Date().toISOString(),
      // Add verification hash
      hash: generateVerificationHash(ticketData)
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(
      JSON.stringify(qrCodeData),
      {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      }
    );

    return qrCodeDataURL;

  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

const generateVerificationHash = (ticketData) => {
  const crypto = require('crypto');
  const data = `${ticketData.ticketId}-${ticketData.eventDate}-${process.env.QR_SECRET || 'garba2025'}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
};

module.exports = {
  generateQRCode,
  generateVerificationHash
};
