const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Account = require('../models/Account');
const Sessions = require('../models/Session');
const {validateToken} = require('../middlewares');


// Get account details
router.get('/account', validateToken, async (req, res) => {
    try {

        // Get a specific users session token
        const sessionId = req.headers.authorization.split(' ')[1]
        // Find a session with the provided Id
        const session = await Sessions.findOne({ _id:sessionId });

        const userAccount = await Account.findOne({user: session.userId}).select({ "account_number": 1, "balance": 1, "user": 1, "_id": 0 });
        if (!userAccount) {
            res.status(404).json({error: "Account not found"})
        }

        res.status(200).json({
            account: userAccount
        })

    } catch (e) {
        res.statusCode = 500
        res.json({error: e.message});
    }
});

// Saves a user with an username and password
router.post('/', async (req, res) => {
    const user = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    });

    const account = new Account({
        user: user._id
    });

    try {
        const savedUser = await user.save();
        const savedAccount = await account.save();
        res.header('location', '/users/' + savedUser._id);
        res.status(201).json();
    } catch (err) {
        res.status(400).json({error: [{msg: "Failed to create an user"}]});
    }
});

module.exports = router;