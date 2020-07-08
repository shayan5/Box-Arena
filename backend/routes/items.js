const router = require('express').Router();
let Item = require('../models/item.model');

router.route('/item-shop').get((req, res) => {
    Item.aggregate([
        { $sort: { cost: 1 } },
        { $project: { armour: 1, cost: 1, _id: 0 } }
    ], (err, docs) => {
        if (err) {
            return res.sendStatus(500);
        }
        return res.json(docs);
    });
});

module.exports = router;