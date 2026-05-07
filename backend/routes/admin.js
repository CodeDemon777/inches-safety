import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Sales by category logic
    const allProducts = await Product.find();
    let salesByCategory = {};
    const orderItems = orders.flatMap(o => o.items);
    
    for (const item of orderItems) {
      const p = allProducts.find(product => product._id.toString() === item.product_id?.toString());
      const cat = p ? p.category : 'General';
      if (!salesByCategory[cat]) {
        salesByCategory[cat] = { name: cat, value: 0 };
      }
      salesByCategory[cat].value += (item.price * item.quantity);
    }

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      salesByCategory: Object.values(salesByCategory)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
