const express = require('express');
const {
    getAllTransactions,
    getStatistics,
    getBarChart,
    getPieChart,
    getCombinedData,
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/transactions', getAllTransactions);
router.get('/statistics/:month', getStatistics);
router.get('/bar-chart/:month', getBarChart);
router.get('/pie-chart/:month', getPieChart);
router.get('/combined/:month', getCombinedData);

module.exports = router;
