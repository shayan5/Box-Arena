const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let Player = require('../models/player.model');

const accessTokenExpiry = 30 * 60; // in seconds
const refreshTokenExpiry = 60 * 60; // in seconds

router.route('/register').post((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (!username || !password || username.length < 3 || !confirmPassword) {
        return res.status(400).json({ message: 'Something went wrong. Please try again later' });
    }
    if (confirmPassword !== password ) {
        return res.json({ message: 'Passwords do not match' });
    }
    bcrypt.genSalt((err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            const newUser = new Player({
                username: username,
                saltedPasswordHash: hash,
            });
            newUser.save()
            .then(() => {
                return res.json({ message: 'Registered successfully!' }) 
            }).catch( (err) => { 
                if (err && err.code === 11000) {
                    return res.json({ message: 'Username is taken' });
                } 
                return res.sendStatus(500);
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
        if (docs && docs.length > 0){
            const player = new Player(docs[0]);
            bcrypt.compare(password, player.saltedPasswordHash, (bcryptErr, same) => {
                if (bcryptErr) {
                    return res.status(500).json({ message: 'Something went wrong. Please try again later' });
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
                            username: username,
                            accessToken: accessToken,
                            accessTokenExpiry: new Date(new Date().getTime() + accessTokenExpiry),
                            refreshToken: refreshToken 
                        });
                    }).catch(() => {
                        return res.status(500).json({ message: 'Something went wrong. Please try again later' });
                    });
                } else {
                    return res.status(401).json({ message: 'Incorrect username or password' });
                }
            });
        } else {
            return res.status(401).json({ message: 'Incorrect username or password' });
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
                        username: user.username,
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

function extractAuthToken(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    return token;
}

function authenticateToken(req, res, next) {
    const token = extractAuthToken(req);
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

function authenticateGameServer(req, res, next) {
    const token = extractAuthToken(req);
    if (token !== process.env.GAME_SERVER_TOKEN_SECRET) {
        return res.sendStatus(403);
    } 
    next();
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.authenticateGameServer = authenticateGameServer;