import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  product_name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image_url: { type: String }
});

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  full_name: { type: String },
  phone: { type: String },
  address_line1: { type: String },
  address_line2: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  total: { type: Number, required: true },
  payment_id: { type: String },
  payment_status: { type: String, default: 'pending' },
  status: { type: String, default: 'placed' },
  items: [orderItemSchema]
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
