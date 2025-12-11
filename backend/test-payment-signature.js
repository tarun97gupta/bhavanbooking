import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Values from Step 3 response
const razorpay_order_id = "order_RqJFAo49dYS2nG";
const razorpay_payment_id = "pay_test_" + Date.now(); // Fake payment ID
const razorpay_secret = process.env.RAZORPAY_SECRET_KEY; // From your .env file

// Generate signature
const signature = crypto
    .createHmac('sha256', razorpay_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

console.log('\n=== PAYMENT SIMULATION VALUES ===\n');
console.log('razorpay_order_id:', razorpay_order_id);
console.log('razorpay_payment_id:', razorpay_payment_id);
console.log('razorpay_signature:', signature);
console.log('\n=================================\n');