import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = (orderData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Fallback font to Helvetica
            doc.font('Helvetica');

            const addressStr = `${orderData.address_line1}, ${orderData.address_line2 ? orderData.address_line2 + ', ' : ''}${orderData.city}, ${orderData.state} - ${orderData.pincode}`;

            const order = {
                invoiceNo: `FAIMX${orderData._id.toString().slice(-6).toUpperCase()}${Math.floor(Math.random()*1000)}`,
                orderId: orderData._id.toString(),
                date: new Date(orderData.createdAt).toLocaleDateString('en-IN').replace(/\//g, '-'),
                paymentStatus: orderData.payment_status || 'pending',
                customer: {
                    name: orderData.full_name || 'Customer',
                    address: addressStr,
                    phone: orderData.phone || 'N/A'
                },
                products: orderData.items.map(item => ({
                    name: item.product_name,
                    qty: item.quantity,
                    price: item.price,
                }))
            };

            const total = orderData.total;
            const taxable = total / 1.18;
            const igst = taxable * 0.18; // Assume 18% IGST for simplicity as per Flipkart example

            let yPos = 30;

            // TAX INVOICE Header
            doc.fontSize(14).font('Helvetica-Bold').text('Tax Invoice', 30, yPos, { align: 'center' });
            yPos += 30;

            // Sold By
            doc.fontSize(10).font('Helvetica-Bold').text('Sold By: INCHES SAFETY PVT LTD ,', 30, yPos);
            yPos += 15;
            doc.font('Helvetica').fontSize(9).text('Ship-from Address: Peelamedu, Coimbatore - 641004,', 30, yPos);
            yPos += 12;
            doc.text('Tamil Nadu, India, IN-TN ,', 30, yPos);
            yPos += 15;
            doc.font('Helvetica-Bold').text('GSTIN - 29ABCDE1234F1Z5', 30, yPos);
            
            yPos += 25;
            doc.font('Helvetica-Bold').fontSize(10).text(`Total items: ${order.products.length}`, 30, yPos);
            yPos += 15;

            // Table Header Background
            doc.rect(30, yPos, 535, 20).fillAndStroke('#f0f0f0', '#cccccc');
            doc.fillColor('black').font('Helvetica-Bold').fontSize(8);
            
            doc.text('Product Title', 35, yPos + 6);
            doc.text('Qty', 220, yPos + 6);
            doc.text('Gross Amount Rs.', 250, yPos + 6);
            doc.text('Discount Rs.', 330, yPos + 6);
            doc.text('Taxable Value Rs.', 390, yPos + 6);
            doc.text('IGST Rs.', 470, yPos + 6);
            doc.text('Total Rs.', 520, yPos + 6);

            yPos += 25;
            doc.font('Helvetica').fontSize(8);

            // Table Rows
            let totalGross = 0;
            let totalQty = 0;

            order.products.forEach((item, index) => {
                const itemTotal = item.qty * item.price;
                const itemTaxable = itemTotal / 1.18;
                const itemIgst = itemTotal - itemTaxable;

                totalGross += itemTotal;
                totalQty += item.qty;

                // Product details block
                doc.font('Helvetica-Bold').text(item.name, 35, yPos, { width: 180 });
                doc.font('Helvetica').fontSize(7).text(`FSN: ACC${Math.random().toString(36).substring(2, 12).toUpperCase()}`, 35, yPos + 10);
                doc.text(`HSN/SAC: 85183000`, 35, yPos + 20);
                doc.text(`Warranty: NA`, 35, yPos + 30);
                doc.text(`18.0 % IGST:`, 35, yPos + 40);

                // Numbers
                doc.fontSize(8);
                doc.text(item.qty.toString(), 225, yPos);
                doc.text(itemTotal.toFixed(2), 260, yPos);
                doc.text('0.00', 340, yPos);
                doc.text(itemTaxable.toFixed(2), 400, yPos);
                doc.text(itemIgst.toFixed(2), 480, yPos);
                doc.text(itemTotal.toFixed(2), 520, yPos);

                yPos += 55;
            });

            // Shipping Charges (Hardcoded for example, typically 40 or 0)
            const shipping = 0;
            if (shipping > 0) {
                doc.text('Shipping And Handling Charges', 35, yPos);
                doc.text('1', 225, yPos);
                doc.text(shipping.toFixed(2), 260, yPos);
                doc.text('0.00', 340, yPos);
                doc.text('0.00', 400, yPos);
                doc.text('0.00', 480, yPos);
                doc.text(shipping.toFixed(2), 520, yPos);
                yPos += 15;
            }

            // Totals Row
            doc.moveTo(30, yPos).lineTo(565, yPos).stroke('#cccccc');
            yPos += 5;
            doc.font('Helvetica-Bold').text('Total', 35, yPos);
            doc.text(totalQty.toString(), 225, yPos);
            doc.text((totalGross + shipping).toFixed(2), 260, yPos);
            doc.text('0.00', 340, yPos);
            doc.text(taxable.toFixed(2), 400, yPos);
            doc.text(igst.toFixed(2), 480, yPos);
            doc.text(total.toFixed(2), 520, yPos);

            yPos += 15;
            doc.moveTo(30, yPos).lineTo(565, yPos).stroke('#cccccc');
            yPos += 5;

            // Grand Total
            doc.fontSize(10).text(`Grand Total Rs. ${total.toFixed(2)}`, 480, yPos);

            yPos += 40;

            // Signature Block
            doc.fontSize(12).font('Courier-Oblique').text('Inches Safety', 450, yPos);
            yPos += 15;
            doc.fontSize(8).font('Helvetica-Bold').text('Signature', 450, yPos);
            yPos += 10;
            doc.font('Helvetica').text('This is a computer generated invoice. No signature required.', 30, yPos);
            
            yPos += 20;

            // Terms
            doc.fontSize(7).text(': At Inches Safety we try to deliver perfectly each and every time. But in the off-chance that you need to return the item, please do so with the original Brand box/price tag, original packing and invoice without which it will be really difficult for us to act on your request. Please help us in helping you. Terms and conditions apply.', 30, yPos, { width: 535 });
            yPos += 25;
            doc.text('The goods sold as are intended for end user consumption and not for re-sale.', 30, yPos);
            yPos += 15;

            // Regd Office
            doc.font('Helvetica-Bold').text('Regd. office:', 30, yPos, { continued: true });
            doc.font('Helvetica').text(' Peelamedu, Coimbatore - 641004, Tamil Nadu, India. INCHES SAFETY PVT LTD', 30, yPos);
            yPos += 15;
            doc.text('Contact Inches Safety: 7092264632 || www.inchessafety.com/helpcentre', 30, yPos);
            yPos += 15;
            doc.text('E. & O.E. page 1 of 1', 30, yPos);

            // Left note
            doc.text('*Keep this invoice and manufacturer box for warranty purposes.', 30, yPos + 15, { width: 150 });

            // Addresses
            yPos += 40;
            doc.moveTo(30, yPos).lineTo(565, yPos).stroke('#cccccc');
            yPos += 10;

            const col1 = 30;
            const col2 = 220;
            const col3 = 410;

            // Column 1: Ship To
            doc.font('Helvetica-Bold').fontSize(9).text('Ship To', col1, yPos);
            doc.font('Helvetica').fontSize(8).text(order.customer.name, col1, yPos + 15);
            doc.text(order.customer.address, col1, yPos + 25, { width: 160 });
            doc.text(`Phone: ${order.customer.phone}`, col1, yPos + 55);

            // Column 2: Bill To
            doc.font('Helvetica-Bold').fontSize(9).text('Bill To', col2, yPos);
            doc.font('Helvetica').fontSize(8).text(order.customer.name, col2, yPos + 15);
            doc.text(order.customer.address, col2, yPos + 25, { width: 160 });
            doc.text(`Phone: ${order.customer.phone}`, col2, yPos + 55);

            // Column 3: Order Details
            doc.font('Helvetica-Bold').fontSize(8).text(`Order ID:`, col3, yPos);
            doc.font('Helvetica').text(order.orderId, col3, yPos + 10);
            
            doc.font('Helvetica-Bold').text(`Order Date:`, col3, yPos + 25, { continued: true }).font('Helvetica').text(` ${order.date}`);
            doc.font('Helvetica-Bold').text(`Invoice Date:`, col3, yPos + 35, { continued: true }).font('Helvetica').text(` ${order.date}`);
            doc.font('Helvetica-Bold').text(`PAN:`, col3, yPos + 45, { continued: true }).font('Helvetica').text(` AAKCK1864D`);
            
            doc.font('Helvetica-Bold').text(`Invoice Number #`, col3, yPos + 60);
            doc.font('Helvetica').text(order.invoiceNo, col3, yPos + 70);

            doc.end();
        } catch (err) {
            console.error("PDF Generation Error:", err);
            reject(err);
        }
    });
};
