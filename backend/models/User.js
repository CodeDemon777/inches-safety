import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: { type: String },
  address_line1: { type: String },
  address_line2: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
