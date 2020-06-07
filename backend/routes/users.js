const router = require('express').Router();
const bcrypt = require('bcrypt');
let User = require('../models/user.model');

router.route('/').get((req, res) => {
    res.send('helllo worlds');
});

router.route('/register').post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    bcrypt.genSalt((err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            const newUser = new User({
                username: username,
                passwordHash: hash,
                passwordSalt: salt
            });
            newUser.save()
                .then(() => res.json('Registered Successfully'))
                .catch(err => res.status(400).json(err));
        });
    });
});

module.exports = router;