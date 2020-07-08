const router = require('express').Router();
let Player = require('../models/player.model');
let auth = require('./authentication');

router.route('/unlocks').get(auth.authenticateToken, (req, res) => {
    Player.findOne({username: req.username}, 'unlocks', (err, docs) => {
        if (err){
            return res.status(404).json(err);
        }
        const player = new Player(docs);
        return res.json(player.unlocks);
    });
});

router.route('/basic-info').get(auth.authenticateToken, (req, res) => {
    Player.findOne(
        { username: req.username }, 
        { currency: 1, _id: 0, unlocks: 1, armour: 1 }, 
        (err, docs) => {
            if (err) {
                return res.sendStatus(404);
            }
            return res.json(docs);
        }
    );
});

router.route('/update-rewards').post(auth.authenticateGameServer, (req, res) => {
    const players = req.body.players;
    const currency = req.body.currency;
    const points = req.body.score;
    if (players && players.length > 0 && currency && points) {
        Player.updateMany({ 
            username: { 
                $in : players
            } 
        }, { $inc: {
                currency: currency,
                points: points
            }
        }, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    } else {
        return res.sendStatus(400);
    }
});

router.route('/currency').get(auth.authenticateToken, (req, res) => {
    Player.findOne({username: req.username}, 'currency', (err, docs) => {
        if (err) {
            return res.status(404).json(err);
        }
        const player = new Player(docs);
        return res.json(player.currency);
    });
});

router.route('/armour').get(auth.authenticateToken, (req, res) => {
    Player.findOne({username: req.username}, 'armour', (err, docs) => {
        if (err) {
            return res.status(404).json(err);
        }
        const player = new Player(docs);
        return res.json(player.armour);
    });
});

router.route('/points').get(auth.authenticateToken, (req, res) => {
    Player.findOne({username: req.username}, 'points', (err, docs) => {
        if (err) {
            return res.status(404).json(err);
        }
        const player = new Player(docs);
        return res.json(player.points);
    });
});

router.route('/change-equipment').post(auth.authenticateToken, (req, res) => {
    const item = req.body.item;
    if (!item) {
        return res.sendStatus(400);
    }
    Player.findOne({username: req.username}, 'unlocks', (err, docs) => {
        if (err) {
            return res.sendStatus(404);
        }
        const player = new Player(docs);
        if (player.unlocks.includes(item)) {
            Player.updateOne(
                { username: req.username }, 
                { $set: { armour: item } }, 
                (err) => {
                    if (err) {
                        return res.sendStatus(500);
                    }
                    return res.sendStatus(204);
                }
            );
        } else {
            return res.sendStatus(400);
        }
    });
});

router.route('/highscores').get((req, res) => {
    Player.aggregate([
        { $sort: { points: -1 } },
        { $limit: 5},
        { $project: { username: 1, points: 1, _id: 0} }
    ], (err, docs) => {
        if (err) {
            return res.status(404).json({ message: 'Something went wrong. Please try again later' });
        }
        return res.json(docs);
    });
});

module.exports = router;