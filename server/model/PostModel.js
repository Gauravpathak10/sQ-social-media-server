const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.set('strictQuery', false);
const PostSchema = Schema({
    postImg: {
        public_id: String,
        url: String
    },
    caption: {
        type: String
    },
    tags: [],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }
})


const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
