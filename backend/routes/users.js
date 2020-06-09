const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let User = require('../models/user.model');

router.route('/').get((req, res) => {
    res.send('helllo worlds');
});

router.route('/register').post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password){
        res.sendStatus(400).json('Error registering account');
    }
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

router.route('/login').post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.find({
        username: username
    }, (err, docs) => {
        if (docs){
            const user = new User(docs[0]);
            bcrypt.compare(password, user.passwordHash, (err, same) => {
                if (same){
                    const accessToken = jwt.sign(
                        {username: username}, 
                        process.env.ACCESS_TOKEN_SECRET, 
                        { expiresIn: '60s' }
                    );
                    return res.json({ accessToken : accessToken });
                } else {
                    return res.status(401).json('Incorrect username or password');
                }
            });
        }
    });
});

router.route('/unlocks').get(authenticateToken, (req, res) => {
    User.findOne({username: req.username}, (err, docs) => {
        if (err){
            return res.status(404).json(err);
        }
        const user = new User(docs);
        return res.json(user.unlocks);
    });
});

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null){
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err){
           return res.sendStatus(403);
        }
        req.username = user.username;
        next();
    });
}

module.exports = router;