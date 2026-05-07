import express from 'express';
import Feedback from '../models/Feedback.js';
import Order from '../models/Order.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { order_id, rating, comment } = req.body;
    
    // Optional: we can extract user_id if we have auth middleware here (e.g. req.user)
    
    // Check if order exists
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const feedback = new Feedback({
      user_id: order.user_id,
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
    }
    const feedbacks = await Feedback.find(filter).populate('user_id', 'full_name email').sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/approve', async (req, res) => {
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

router.post('/admin', async (req, res) => {
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
