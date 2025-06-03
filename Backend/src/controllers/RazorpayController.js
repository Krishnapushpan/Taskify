import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../../models/PaymentModel.js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { amount, projectId } = req.body;
    
    if (!amount || !projectId) {
      return res.status(400).json({ error: 'Amount and projectId are required' });
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    // Create a pending payment record
    const payment = new Payment({
      orderId: order.id,
      projectId: projectId,
      amount: amount,
      currency: order.currency,
      status: 'pending',
      createdBy: req.user._id, // Assuming you have user info in req.user
    });

    await payment.save();

    res.json({
      ...order,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
};

// Verify payment signature
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    // Create signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // Verify signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update payment record
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Payment record not found' });
      }

      payment.paymentId = razorpay_payment_id;
      payment.signature = razorpay_signature;
      payment.status = 'completed';
      payment.paymentDetails = {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        verifiedAt: new Date()
      };

      await payment.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment: payment
      });
    } else {
      // Update payment record as failed
      const payment = await Payment.findById(paymentId);
      if (payment) {
        payment.status = 'failed';
        payment.paymentDetails = {
          error: 'Signature verification failed',
          failedAt: new Date()
        };
        await payment.save();
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Error verifying payment' });
  }
};

// Get payment history for a project
export const getPaymentHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const payments = await Payment.find({ projectId })
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Error fetching payment history' });
  }
}; 