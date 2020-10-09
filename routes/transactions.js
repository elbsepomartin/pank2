const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Account = require('../models/Account');
const Sessions = require('../models/Session');
const Transactions = require('../models/Transaction');
const {validateToken} = require('../middlewares');

// Transaction logic
router.put('/', validateToken, async (req, res, next) => {
    try {
        // Get a specific users session token
        const sessionId = req.headers.authorization.split(' ')[1]
        // Find a session with the provided Id
        const session = await Sessions.findOne({ _id: sessionId });

        const account = await Account.findOne({user: session.userId}).select({ "account_number": 1, "balance": 1, "currency": 1, "user": 1 });

        const { account_to, amount } = req.body;
        const accountTo = await Account.findOne({ account_number: account_to });
        const accountFrom = await Account.findOne({ account_number: account.account_number });

        if (!accountTo) return res.status(400).json({
            error: "The provided account number was not found or is not associated with any bank account"
        });

        if (typeof amount === 'string' || amount instanceof String) return res.status(400).json({ error: "Insert an amount as a number" });
        if (account_to == account.account_number) return res.status(400).json({ error: "Unable to send funds to your own account" });
        if (amount > accountFrom.balance) return res.status(400).json({ error: "Insufficient funds" });

        // Transaction logic
        // Sender
        Account.findOneAndUpdate({ account_number: accountFrom.account_number }, { balance: accountFrom.balance - amount}, function (err, response) {
            if(err) res.status(400).json({ error: "Something went wrong" });
            res.status(200).json({ message: "Transaction successful. Your account balance now is: " + (accountFrom.balance - amount)});
        });

        // Receiver
        Account.findOneAndUpdate({ account_number: accountTo.account_number }, { balance: accountTo.balance + amount}, function (err, response) {
            if(err) res.status(400).json({ error: "Something went wrong" });
            console.log("Transaction from: " + accountFrom.account_number);
        });

        const newTransactions = new Transactions({ accountTo: accountTo.user._id, accountFrom: accountFrom.user._id, amount });
        console.log("Transaction to: " + accountTo.account_number)
        await newTransactions.save();
    }

    catch (e) {
        next(e);
    }
});

// Transaction history
router.get('/', validateToken, async (req, res, next) => {
    try {

        // Get a specific users session token
        const sessionId = req.headers.authorization.split(' ')[1]
        // Find a session with the provided Id
        const session = await Sessions.findOne({ _id: sessionId });

        // const accountFromId = await Account.findOne({user: session.userId});
        // const accountToId = await Account.findOne({user: session.userId});

        const userTransaction = await Transactions.find({ accountFrom: session.userId }).select({ "accountTo": 1, "accountFrom": 1, "amount": 1, "_id": 0 });
        const receiveTransaction = await Transactions.find({ accountTo: session.userId }).select({ "accountTo": 1, "accountFrom": 1, "amount": 1, "_id": 0 });

        if (!userTransaction && !receiveTransaction) {
            res.status(200).json({ message: "Teil pole ühtegi ülekannet" });
        }

        if (receiveTransaction) {
            res.status(200).json({ transaction_history: receiveTransaction });
        }

        res.status(200).json({ transaction_history: userTransaction });

    } catch (e) {
        
    }
});


module.exports = router;