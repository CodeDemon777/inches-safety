import express from 'express';
import Feedback from '../models/Feedback.js';
import Order from '../models/Order.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { order_id, rating, comment } = req.body;
    
    // Check if order exists and belongs to the authenticated user
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden: You do not own this order.' });
    }
    
    const feedback = new Feedback({
      user_id: req.user._id,
      order_id,
      rating,
      comment
    });
    
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.approved === 'true') {
      filter.approved = true;
    } else {
      // Require Admin manually to query all/pending feedbacks
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    const feedbacks = await Feedback.find(filter).populate('user_id', 'full_name email').sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    
    feedback.approved = !feedback.approved;
    await feedback.save();
    
    res.json({ message: 'Feedback approval status updated', feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin', requireAdmin, async (req, res) => {
  try {
    const { guest_name, rating, comment } = req.body;
    
    const feedback = new Feedback({
      guest_name,
      rating,
      comment,
      approved: true, // Auto-approve admin created feedbacks
    });
    
    await feedback.save();
    res.status(201).json({ message: 'Feedback created by admin successfully', feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
