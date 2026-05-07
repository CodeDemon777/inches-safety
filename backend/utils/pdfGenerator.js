import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fetchImage = (url) => {
    return new Promise((resolve, reject) => {
        if (!url) return resolve(null);
        if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
            const client = http;
            client.get(url, (res) => {
                const data = [];
                res.on('data', chunk => data.push(chunk));
                res.on('end', () => resolve(Buffer.concat(data)));
            }).on('error', reject);
        } else if (url.startsWith('https')) {
            https.get(url, (res) => {
                const data = [];
                res.on('data', chunk => data.push(chunk));
                res.on('end', () => resolve(Buffer.concat(data)));
            }).on('error', reject);
        } else {
            resolve(null);
        }
    });
};

export const generateInvoicePDF = (orderData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40 });
            
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const addressStr = `${orderData.address_line1}, ${orderData.address_line2 ? orderData.address_line2 + ', ' : ''}${orderData.city}, ${orderData.state} - ${orderData.pincode}`;

            const order = {
                invoiceNo: `INV-${orderData._id.toString().slice(-6).toUpperCase()}`,
                orderId: orderData._id.toString(),
                date: new Date(orderData.createdAt).toLocaleDateString(),
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
                    image_url: item.image_url
                }))
            };

            const total = orderData.total;
            const taxable = total / 1.18;
            const cgst = taxable * 0.09;
            const sgst = taxable * 0.09;

            const logoPath = path.join(__dirname, '../assets/logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 40, 30, { width: 80 });
            }

            try {
                const qrDataUrl = await QRCode.toDataURL(order.orderId);
                doc.image(qrDataUrl, 460, 30, { width: 80 });
            } catch (e) {
                console.error("QR Code Error:", e);
            }

            doc.fontSize(24).fillColor('#2563eb').text('INCHES SAFETY', 150, 40, { align: 'left' });
            doc.fontSize(18).fillColor('black').text('TAX INVOICE', 150, 70, { align: 'left' });

            doc.moveDown(2);
            let yPos = doc.y;

            doc.fontSize(11);
            doc.text('Sold By:', 40, yPos);
            doc.text('Inches Safety Pvt Ltd', 40, yPos + 15);
            doc.text('Peelamedu, Coimbatore - 641004', 40, yPos + 30);
            doc.text('GSTIN: 29ABCDE1234F1Z5', 40, yPos + 45);

            doc.text('Bill To:', 300, yPos);
            doc.text(order.customer.name, 300, yPos + 15);
            doc.text(order.customer.address, 300, yPos + 30, { width: 200 });
            doc.text(order.customer.phone, 300, yPos + 60);

            yPos += 90;
            doc.text(`Invoice No: ${order.invoiceNo}`, 40, yPos);
            doc.text(`Order ID: ${order.orderId}`, 40, yPos + 15);
            doc.text(`Date: ${order.date}`, 40, yPos + 30);

            const statusColors = {
                paid: 'green',
                completed: 'green',
                pending: 'orange',
                failed: 'red'
            };
            const pColor = statusColors[order.paymentStatus.toLowerCase()] || 'black';
            doc.fillColor(pColor).text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 300, yPos + 15);
            doc.fillColor('black');

            try {
                const barcodeBuffer = await bwipjs.toBuffer({
                    bcid: 'code128',
                    text: order.orderId,
                    scale: 2,
                    height: 10,
                    includetext: true,
                    textxalign: 'center',
                });
                doc.image(barcodeBuffer, 40, yPos + 50, { width: 150 });
            } catch (e) {
                console.error("Barcode Error:", e);
            }

            let tableTop = yPos + 100;
            doc.rect(40, tableTop, 520, 25).fill('#2563eb');
            doc.fillColor('white').fontSize(11);
            doc.text('Product', 50, tableTop + 7);
            doc.text('Qty', 300, tableTop + 7);
            doc.text('Price', 380, tableTop + 7);
            doc.text('Total', 470, tableTop + 7);

            let position = tableTop + 40;
            doc.fillColor('black');

            for (const item of order.products) {
                const itemTotal = item.qty * item.price;

                if (item.image_url) {
                    try {
                        const imgBuf = await fetchImage(item.image_url);
                        if (imgBuf) {
                            doc.image(imgBuf, 50, position - 5, { width: 30, height: 30 });
                        }
                    } catch (e) {
                        console.log("Failed to load product image for pdf");
                    }
                }

                doc.text(item.name, 90, position, { width: 200 });
                doc.text(item.qty.toString(), 300, position);
                doc.text(`Rs. ${item.price.toFixed(2)}`, 380, position);
                doc.text(`Rs. ${itemTotal.toFixed(2)}`, 470, position);

                position += 40;
            }

            doc.moveTo(40, position).lineTo(560, position).stroke();
            position += 20;

            doc.fontSize(11).text('Taxable Value', 320, position);
            doc.text(`Rs. ${taxable.toFixed(2)}`, 470, position);
            position += 15;
            
            doc.text('CGST 9%', 320, position);
            doc.text(`Rs. ${cgst.toFixed(2)}`, 470, position);
            position += 15;
            
            doc.text('SGST 9%', 320, position);
            doc.text(`Rs. ${sgst.toFixed(2)}`, 470, position);
            position += 15;

            doc.fontSize(14).font('Helvetica-Bold').text('Grand Total:', 320, position);
            doc.text(`Rs. ${total.toFixed(2)}`, 470, position);
            doc.font('Helvetica');

            position += 50;
            doc.fontSize(18).font('Courier-Oblique').text('Inches Safety', 400, position);
            doc.fontSize(10).font('Helvetica').text('Authorized Signatory', 400, position + 20);

            position += 60;
            doc.fontSize(10).text('This is a computer generated invoice.', 40, position, { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};
