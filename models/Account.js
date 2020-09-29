const mongoose = require('mongoose');

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

module.exports = mongoose.model('Account', new mongoose.Schema({

    account_number: {
        type: String,
        default: "EE" + generate(16)
    },

    balance: {
        type: String,
        default: 50
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}));