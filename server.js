const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes');

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());
app.use('/api', transactionRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
