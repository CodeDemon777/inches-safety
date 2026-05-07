import express from 'express';
import PDFDocument from 'pdfkit';
import Order from '../models/Order.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const orderData = await Order.findById(req.params.id);
        
        if (!orderData) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const addressStr = `${orderData.address_line1}, ${orderData.address_line2 ? orderData.address_line2 + ', ' : ''}${orderData.city}, ${orderData.state} - ${orderData.pincode}`;

        const order = {
            invoiceNo: `INV-${orderData._id.toString().slice(-6).toUpperCase()}`,
            orderId: orderData._id.toString(),
            date: new Date(orderData.createdAt).toLocaleDateString(),

            customer: {
                name: orderData.full_name || 'Customer',
                address: addressStr,
                phone: orderData.phone || 'N/A'
            },

            products: orderData.items.map(item => ({
                name: item.product_name,
                qty: item.quantity,
                price: item.price
            }))
        };

        const doc = new PDFDocument({ margin: 40 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${order.invoiceNo}.pdf`
        );

        doc.pipe(res);

        // ======================
        // HEADER
        // ======================

        doc
          .fontSize(24)
          .fillColor('#2563eb')
          .text('INCHES SAFETY', { align: 'center' });

        doc.moveDown();

        doc
          .fontSize(18)
          .fillColor('black')
          .text('TAX INVOICE', { align: 'center' });

        doc.moveDown(2);

        // ======================
        // COMPANY DETAILS
        // ======================

        doc.fontSize(11);

        doc.text('Sold By:');
        doc.text('Inches Safety Pvt Ltd');
        doc.text('Peelamedu, Coimbatore - 641004');
        doc.text('GSTIN: 29ABCDE1234F1Z5');

        doc.moveDown();

        // ======================
        // CUSTOMER DETAILS
        // ======================

        doc.text(`Invoice No: ${order.invoiceNo}`);
        doc.text(`Order ID: ${order.orderId}`);
        doc.text(`Date: ${order.date}`);

        doc.moveDown();

        doc.text('Bill To:');
        doc.text(order.customer.name);
        doc.text(order.customer.address);
        doc.text(order.customer.phone);

        doc.moveDown(2);

        // ======================
        // TABLE HEADER
        // ======================

        const tableTop = 300;

        doc.rect(40, tableTop, 520, 25).fill('#2563eb');

        doc
          .fillColor('white')
          .fontSize(11);

        doc.text('Product', 50, tableTop + 7);
        doc.text('Qty', 300, tableTop + 7);
        doc.text('Price', 380, tableTop + 7);
        doc.text('Total', 470, tableTop + 7);

        // ======================
        // TABLE ROWS
        // ======================

        let position = tableTop + 40;
        let grandTotal = 0;

        doc.fillColor('black');

        order.products.forEach((item) => {
            const total = item.qty * item.price;
            grandTotal += total;

            doc.text(item.name, 50, position, { width: 240 });
            doc.text(item.qty.toString(), 300, position);
            doc.text(`Rs. ${item.price}`, 380, position);
            doc.text(`Rs. ${total}`, 470, position);

            position += 30;
        });

        // ======================
        // TOTAL
        // ======================

        doc.moveTo(40, position)
           .lineTo(560, position)
           .stroke();

        position += 20;

        doc
          .fontSize(14)
          .text(`Grand Total: Rs. ${grandTotal}`, 380, position);

        // ======================
        // FOOTER
        // ======================

        position += 80;

        doc
          .fontSize(10)
          .text(
            'This is a computer generated invoice.',
            40,
            position,
            { align: 'center' }
          );

        doc.end();
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
});

export default router;
