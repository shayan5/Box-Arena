const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let Player = require('../models/player.model');

const accessTokenExpiry = 30; // in seconds
const refreshTokenExpiry = 75; // in seconds

router.route('/register').post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password){
        return res.sendStatus(400);
    }
    bcrypt.genSalt((err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            const newUser = new Player({
                username: username,
                saltedPasswordHash: hash,
            });
            newUser.save()
            .then(() => {
                return res.json('Registered Successfully') 
            }).catch( (err) => { 
                return res.status(400).json(err)
            });
        });
    });
});

router.route('/login').post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password){
        return res.sendStatus(400);
    }
    Player.find({
        username: username
    }, 'username saltedPasswordHash', (err, docs) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (docs){
            const player = new Player(docs[0]);
            bcrypt.compare(password, player.saltedPasswordHash, (bcryptErr, same) => {
                if (bcryptErr) {
                    return res.sendStatus(500);
                }
                if (same){
                    const accessToken = jwt.sign(
                        {username: username}, 
                        process.env.ACCESS_TOKEN_SECRET, 
                        { expiresIn: accessTokenExpiry }
                    );
                    const refreshToken = jwt.sign(
                        {username: username},
                        process.env.REFRESH_TOKEN_SECRET,
                        { expiresIn: refreshTokenExpiry }
                    );
                    Player.updateOne(
                        {username: username}, 
                        {$set: {refreshToken: refreshToken}}, 
                        {upsert: true}
                    ).then(() => {
                        res.cookie('refreshToken', refreshToken, {
                            httpOnly: true,
                            maxAge: new Date(new Date().getTime() + refreshTokenExpiry)}
                        );
                        return res.json({ 
                            accessToken: accessToken,
                            accessTokenExpiry: new Date(new Date().getTime() + accessTokenExpiry),
                            refreshToken: refreshToken 
                        });
                    }).catch(() => {
                        return res.sendStatus(500);
                    });
                } else {
                    return res.status(401).json('Incorrect username or password');
                }
            });
        }
    });
});

router.route('/logout').post(authenticateToken, (req, res) => {
    Player.updateOne({username: req.username}, {$unset: { refreshToken: "" }})
    .then(() => {
        res.cookie('refreshToken', "", {httpOnly: true});
        return res.sendStatus(200);
    }).catch(() => {
        return res.sendStatus(500);
    });
});

router.route('/refresh-token').post((req, res) => {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
        return res.sendStatus(403);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
           return res.sendStatus(403);
        } 
        Player.findOne({ username: user.username }, 'refreshToken', (err, docs) => {
            if (err) {
                return res.sendStatus(404);
            }
            const player = new Player(docs);
            if (player.refreshToken === refreshToken){
                const newAccessToken = jwt.sign(
                    { username: user.username },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: accessTokenExpiry }
                );
                const newRefreshToken = jwt.sign(
                    { username: user.username },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: refreshTokenExpiry }
                );
                Player.updateOne(
                    { username: user.username }, 
                    { $set: { refreshToken: newRefreshToken } }, 
                    { upsert: true }
                ).then(() => {
                    res.cookie('refreshToken', newRefreshToken, {
                        httpOnly: true,
                        maxAge: new Date(new Date().getTime() + refreshTokenExpiry)
                    });
                    return res.json({
                        accessToken: newAccessToken,
                        accessTokenExpiry: new Date(new Date().getTime() + accessTokenExpiry),
                        refreshToken: newRefreshToken
                    });
                }).catch(() => {
                    return res.sendStatus(500);
                });
            } else {
                return res.sendStatus(403);
            }
        });
    })
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
module.exports.authenticateToken = authenticateToken;