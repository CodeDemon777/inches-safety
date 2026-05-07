import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  approved: { type: Boolean, default: false },
  guest_name: { type: String }, // For admin-created feedbacks
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
