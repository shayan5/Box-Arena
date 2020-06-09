const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    passwordHash: String,
    passwordSalt: String,
    unlocks: {
        type: Array,
        default: []
    }
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;