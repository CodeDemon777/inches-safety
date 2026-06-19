import mongoose from 'mongoose';
import Product from './models/Product.js';

const run = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ecocycle');
    console.log('Connected to MongoDB');

    const image_url = 'http://localhost:5000/uploads/media__1781863237198.jpg';
    const image_urls = [
      'http://localhost:5000/uploads/media__1781863237198.jpg',
      'http://localhost:5000/uploads/media__1781863237234.jpg'
    ];

    const result = await Product.updateMany(
      {},
      {
        $set: {
          image_url: image_url,
          image_urls: image_urls
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} products out of ${result.matchedCount} found.`);
    
    // List products to verify
    const products = await Product.find({});
    console.log('Current Products in DB:');
    products.forEach(p => {
      console.log(`- ${p.name} (${p._id}): image_url=${p.image_url}, image_urls=${JSON.stringify(p.image_urls)}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
