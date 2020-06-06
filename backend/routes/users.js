const router = require('express').Router();
let User = require('../models/user.model');

router.route('/').get((req, res) => {
    res.send('helllo worlds');
});

router.route('/register').post((req, res) => {
    const username = req.body.username;
    const newUser = new User({
        username: username,
        passwordHash: "adfs",
        passwordSalt: "sdfasdf34"
    });
    newUser.save()
        .then(() => res.json('Registered Successfully'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;