const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    saltedPasswordHash: String,
    refreshToken: String,
    points: {
        type: Number,
        default: 0
    },
    currency: {
        type: Number,
        default: 0
    },
    unlocks: {
        type: Array,
        default: ["default"]
    },
    armour: {
        type: String,
        default: "default"
    }
});

const Player = mongoose.model('Player', playerSchema, 'users');

module.exports = Player;