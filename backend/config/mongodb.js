// module.exports = connectDB;
//config/mongodb.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
    mongoose.connection.on('connected', () =>
        console.log('MongoDB is connected'));
    
    //databae nam chara :
    await mongoose.connect(process.env.MONGODB_URI);

    // Ensure googleId index is non-unique and sparse to avoid duplicate null key errors
    try {
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        const indexes = await usersCollection.indexes();
        const googleIdx = indexes.find((idx) => idx.name === 'googleId_1');

        if (googleIdx && googleIdx.unique) {
            await usersCollection.dropIndex('googleId_1');
        }

        // Recreate as sparse, non-unique (idempotent if already exists as desired)
        await usersCollection.createIndex({ googleId: 1 }, { sparse: true });
    } catch (e) {
        // Log and continue; app can still run even if index operation fails
        console.warn('Index check/create failed:', e.message);
    }

    console.log('MongoDB connected');
};

module.exports = connectDB;