const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.set('strictQuery', false);
const UserSchema = Schema({
    userName: {
        type: String,
    },
    avatar: {
        public_id: String,
        url: String
    },
    email: {
        type: String,
        unique: [true, 'User Already exists']
    },
    password: {
        type: String,
    },
    posts: [
        {
            type: String,

        }
    ],
    isActive: {
        type: Boolean,
        default: false
    },
    notifications: [
        {
            type: String,

        },
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
});



const User = mongoose.model('User', UserSchema);
module.exports = User;
