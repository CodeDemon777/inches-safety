import express from 'express';
import Order from '../models/Order.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'inches.safety@gmail.com',
    pass: 'dzcltojkoxqjzfce'
  }
});

const sendOrderEmail = async (order, subject, message) => {
  try {
    let pdfBuffer = null;
    try {
        pdfBuffer = await generateInvoicePDF(order);
    } catch(e) {
        console.error("Failed to generate PDF for email:", e);
    }

    const mailOptions = {
      from: '"Inches Eco Store" <inches.safety@gmail.com>',
      to: order.email,
      subject: subject,
      text: `${message}\n\nOrder Details:\nOrder ID: ${order._id}\nTotal: ₹${order.total}\nStatus: ${order.status}`,
    };

    if (pdfBuffer) {
        mailOptions.attachments = [
           {
              filename: `INV-${order._id.toString().slice(-6).toUpperCase()}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
           }
        ];
    }

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${order.email}`);
  } catch (err) {
    console.error('Email error:', err);
  }
};

router.post('/', requireAuth, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user_id: req.user._id
    });
    await order.save();
    order.payment_status = 'completed';
    await order.save();

    // Send confirmation email
    await sendOrderEmail(order, 'Order Confirmation - Inches Eco Store', `Thank you for your purchase! Your order has been placed successfully.`);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my-orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    // Send email notification for shipped/delivered
    let message = '';
    let subject = '';
    if (status === 'shipped') {
      subject = 'Your Order Has Been Shipped!';
      message = 'Good news! Your order is on its way to you.';
    } else if (status === 'delivered') {
      subject = 'Your Order Has Been Delivered!';
      message = 'Your order has arrived! Thank you for shopping with us.';
    }
    
    if (message) {
      await sendOrderEmail(order, subject, message);
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/payment-status', requireAdmin, async (req, res) => {
  try {
    const { payment_status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { payment_status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
