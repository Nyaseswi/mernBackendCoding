const Transaction = require('../models/Transaction');
const axios = require('axios');

const getMonthRange = (month) => {
    const startDate = new Date(`2023-${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    return { startDate, endDate };
};

const getAllTransactions = async (req, res) => {
    const { month, search = '', page = 1, perPage = 10 } = req.query;
    const { startDate, endDate } = getMonthRange(month);
    const regex = new RegExp(search, 'i');

    const transactions = await Transaction.find({
        dateOfSale: { $gte: startDate, $lt: endDate },
        $or: [
            { title: regex },
            { description: regex },
            { price: regex },
        ],
    })
        .skip((page - 1) * perPage)
        .limit(parseInt(perPage));

    res.json(transactions);
};

const getStatistics = async (req, res) => {
    const { month } = req.params;
    const { startDate, endDate } = getMonthRange(month);

    const totalSales = await Transaction.aggregate([
        { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: null, totalAmount: { $sum: '$price' }, totalCount: { $sum: 1 }, totalSold: { $sum: { $cond: ['$sold', 1, 0] } }, totalNotSold: { $sum: { $cond: ['$sold', 0, 1] } } } }
    ]);

    res.json(totalSales[0]);
};

const getBarChart = async (req, res) => {
    const { month } = req.params;
    const { startDate, endDate } = getMonthRange(month);

    const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity }
    ];

    const barChart = await Promise.all(priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
            price: { $gte: range.min, $lte: range.max },
            dateOfSale: { $gte: startDate, $lt: endDate }
        });
        return { range: range.range, count };
    }));

    res.json(barChart);
};

const getPieChart = async (req, res) => {
    const { month } = req.params;
    const { startDate, endDate } = getMonthRange(month);

    const categories = await Transaction.aggregate([
        { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json(categories);
};

const getCombinedData = async (req, res) => {
    const { month } = req.params;
    const { startDate, endDate } = getMonthRange(month);

    const [transactions, statistics, barChart, pieChart] = await Promise.all([
        Transaction.find({ dateOfSale: { $gte: startDate, $lt: endDate } }),
        Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: null, totalAmount: { $sum: '$price' }, totalCount: { $sum: 1 }, totalSold: { $sum: { $cond: ['$sold', 1, 0] } }, totalNotSold: { $sum: { $cond: ['$sold', 0, 1] } } } }
        ]),
        Promise.all(priceRanges.map(async (range) => {
            const count = await Transaction.countDocuments({
                price: { $gte: range.min, $lte: range.max },
                dateOfSale: { $gte: startDate, $lt: endDate }
            });
            return { range: range.range, count };
        })),
        Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ])
    ]);

    res.json({ transactions, statistics: statistics[0], barChart, pieChart });
};

module.exports = {
    getAllTransactions,
    getStatistics,
    getBarChart,
    getPieChart,
    getCombinedData,
};
