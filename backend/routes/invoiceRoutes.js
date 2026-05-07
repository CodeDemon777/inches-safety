import express from 'express';
import Order from '../models/Order.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const orderData = await Order.findById(req.params.id);
        
        if (!orderData) {
            return res.status(404).json({ error: 'Order not found' });
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
