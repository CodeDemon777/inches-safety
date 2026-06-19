import express from 'express';
import Order from '../models/Order.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', requireAuth, async (req, res) => {
    try {
        const orderData = await Order.findById(req.params.id);
        
        if (!orderData) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Authorize: user must be an admin OR own the order
        if (req.user.role !== 'admin' && orderData.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to view this invoice.' });
        }

        const pdfBuffer = await generateInvoicePDF(orderData);
        const invoiceNo = `INV-${orderData._id.toString().slice(-6).toUpperCase()}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${invoiceNo}.pdf`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
});

export default router;
