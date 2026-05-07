import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const run = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ecocycle');
    const user = await User.findOneAndUpdate(
      { email: 'inches.safety@gmail.com' },
      { role: 'admin' },
      { new: true }
    );
    if (user) {
      console.log(`Successfully updated ${user.email} to role: ${user.role}`);
    } else {
      console.log('User not found in DB. Make sure you signed up first with this email.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
