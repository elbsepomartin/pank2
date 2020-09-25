const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Saves a user with an username and password
router.post('/', async (req, res) => {
    const user = new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    });

    try {
        const savedUser = await user.save();
        res.header('location', '/users/' + savedUser._id);
        res.status(201).json();
    } catch (err) {
        res.status(400).json({ error: [{ msg: "Failed to create an user" }] });
    }
});

module.exports = router;