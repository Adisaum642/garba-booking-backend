// routes/payment.js
const express = require('express');
const Razorpay = require('razorpay');

const router = express.Router();

// Debug: Check if environment variables are loaded
console.log('🔍 Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'MISSING');
console.log('🔍 Razorpay Secret:', process.env.RAZORPAY_SECRET ? 'Present' : 'MISSING');

// Initialize Razorpay with proper error handling
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    throw new Error('Razorpay credentials missing in environment variables');
  }

  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });
  
  console.log('✅ Razorpay initialized successfully');
} catch (error) {
  console.error('❌ Razorpay initialization failed:', error.message);
}

// Create payment order - MATCHES YOUR FRONTEND: /api/create-payment-order
router.post('/create-payment-order', async (req, res) => {
  try {
    console.log('🚀 Creating payment order with data:', req.body);
    
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount provided'
      });
    }

    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay not configured properly',
        error: 'Missing API credentials'
      });
    }

    // Create order with detailed logging
    console.log('📝 Order details:', {
      amount: amount * 100,
      currency,
      receipt: receipt || `garba_${Date.now()}`
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: receipt || `garba_${Date.now()}`,
    });

    console.log('✅ Payment order created successfully:', order.id);

    res.json({
      success: true,
      order: {
        id: order.id,
        currency: order.currency,
        amount: order.amount,
      }
    });

  } catch (error) {
    console.error('❌ Payment order creation failed:', error);
    
    // Detailed error logging for authentication issues
    if (error.statusCode === 401) {
      console.error('🔐 Authentication Error - Check your Razorpay credentials');
      console.error('🔐 Key ID:', process.env.RAZORPAY_KEY_ID ? 'Present' : 'MISSING');
      console.error('🔐 Secret:', process.env.RAZORPAY_SECRET ? 'Present' : 'MISSING');
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.error?.description || error.message,
      statusCode: error.statusCode
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Payment routes working',
    razorpayConfigured: !!razorpay,
    keyPresent: !!process.env.RAZORPAY_KEY_ID,
    secretPresent: !!process.env.RAZORPAY_SECRET
  });
});

module.exports = router;
