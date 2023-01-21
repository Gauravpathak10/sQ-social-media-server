
const Post = require("../model/PostModel");
const User = require("../model/UserModel");
const cloudinary = require('../cloud');

//creating post
exports.createPost = async (req, res) => {
    try {
        const file = req.files.postimg
        const data = await cloudinary.uploader.upload(file.tempFilePath)
        const post = {
            caption: req.body.caption,
            postImg: {
                public_id: data._public_id,
                url: data.secure_url
            },
            owner: req.user._id,
            tags: ['your tags', req.body.tags]
        }
        const posted = await Post.create(post);
        const user = await User.findById(req.user._id);
        user.posts.push(posted._id);

        await user.save()
        res.status(201).json({
            message: 'SuccessFully created post',
            status: true,
            data: posted
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }
}

//Like and dislike , with notifcation send to respected users
exports.likeUnlikePost = async (req, res) => {
    const usercheck = JSON.stringify(req.user._id).split("ObjectId")[0].replace(/['"]+/g, '')
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                status: false
            })
        }
        if (post.likes.includes(req.user._id)) {
            const ind = post.likes.indexOf(req.user._id);
            post.likes.splice(ind, 1);
            await post.save()
            const user = await User.findById(req.user._id);
            user.notifications.pop(usercheck)
            await user.save()
            return res.status(201).json({
                message: 'Post unliked',
                status: true,
                id: req.user._id
            })
        }
        else {
            post.likes.push(req.user._id);
            await post.save();
            const user = await User.findById(post.owner);
            user.notifications.push(usercheck + ' has liked your post '+ Date(Date.now()))
            await user.save()
            return res.status(201).json({
                message: 'Post liked',
                status: true,
                id: req.user._id,
                data: post.owner
            })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }
}


//delete post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: false,
                message: "Post not found"
            })
        }
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                status: false,
                message: "unauthorized"
            })
        }
        await post.remove();

        const user = await User.findById(req.user._id);
        const ind = user.posts.indexOf(req.params.id);
        user.posts.splice(ind, 1);

        await user.save();
        return res.status(201).json({
            status: true,
            message: "post deleted"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }
}

//get Posts of following users
exports.getPostOffFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const posts = await Post.find({
            owner: {
                $in: user.following
            }
        })
        return res.status(201).json({
            status: true,
            posts: posts
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }
}

//update post
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({
                status: false,
                message: "no post found"
            })
        }
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                status: false,
                message: "unauthorized"
            })
        }
        post.caption = req.body.caption,

            await post.save()
        return res.status(201).json({
            status: true,
            message: "post updated"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }
}

//add comment
exports.addAComment = async (req, res) => {
    try {
        const usercheck = JSON.stringify(req.user._id).split("ObjectId")[0].replace(/['"]+/g, '')
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                status: false,
                message: "post not found"
            })
        }
        let commentExists = -1;

        //checking for duplicate comments
        post.comments.forEach((item, index) => {
            if (item.user.toString() === req.user._id.toString()) {
                commentExists = index
            }
        })

        if (commentExists !== -1) {
            post.comments[commentExists].comment = req.body.comment;
            await post.save();
            res.status(201).json({
                message: "comment added",
                status: true
            })
        } else {
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment
            })
            await post.save()
            res.status(201).json({
                message: "comment exists",
                status: true
            })
            const userId = JSON.stringify(post.owner).split("ObjectId")[0].replace(/['"]+/g, '')
            const user = await User.findById(userId);
            user.notifications.push(usercheck + ' has commented on  your post');
            await user.save()
        }



    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }
}

