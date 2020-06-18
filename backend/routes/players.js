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

router.route('/currency').get(auth.authenticateToken, (req, res) => {
    Player.findOne({username: req.username}, 'currency', (err, docs) => {
        if (err) {
            return res.status(404).json(err);
        }
        const player = new Player(docs);
        return res.json(player.currency);
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