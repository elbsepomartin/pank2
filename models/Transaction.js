const mongoose = require('mongoose');

module.exports = mongoose.model('Transactions', new mongoose.Schema({
    accountFrom: String,
    accountTo: String,
    amount: Number
}));