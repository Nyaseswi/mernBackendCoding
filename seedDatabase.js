const mongoose = require('mongoose');
const axios = require('axios');
const Transaction = require('./models/Transaction');

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

const API_URL = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

mongoose.connect(MONGODB_URI);


const seedDatabase = async () => {
    try {
        const response = await axios.get(API_URL);
        const transactions = response.data;

        await Transaction.deleteMany({});
        await Transaction.insertMany(transactions);

        console.log('Database seeded successfully');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

seedDatabase();
