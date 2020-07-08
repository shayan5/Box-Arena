const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    armour: {
        type: String,
        default: "default"
    },
    cost: {
        type: Number,
        default: 0
    }
});

const Item = mongoose.model('Item', itemSchema, 'items');

module.exports = Item;