const mongoose = require('mongoose');
require('dotenv').config();

function generate(n) {
    var add = 1, max = 12 - add;

    if (n > max) {
        return generate(max) + generate(n - max);
    }

    max = Math.pow(10, n + add);
    var min = max / 10;
    var number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
}

const accountSchema = new mongoose.Schema({

    account_number: {
        type: String,
        default: process.env.BANK_PREFIX + generate(16)
    },

    balance: {
        type: Number,
        default: 10000
    },

    currency: {
        type: String,
        default: "EUR",
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
});

module.exports = mongoose.model('Account', accountSchema);