import mongoose from 'mongoose';

const run = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ecocycle');
        await mongoose.connection.db.collection('users').deleteMany({});
        console.log('All users cleared from the database.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
run();
