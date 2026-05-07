import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  original_price: { type: Number },
  price: { type: Number, required: true },
  image_url: { type: String },
  image_urls: { type: [String], default: [] },
  category: { type: String, default: 'XL' },
  sale_type: { type: String, enum: ['Normal', 'Wholesale', 'Both'], default: 'Normal' },
  tags: { type: [String], default: [] },
  stock: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
