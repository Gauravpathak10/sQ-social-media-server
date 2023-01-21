const express = require('express');
const { createPost, likeUnlikePost, deletePost, getPostOffFollowing, updatePost, addAComment, getMostLike } = require('../controller/PostController');
const { isAuthenticated } = require('../middlewares/authenticate');

const postRouter = express.Router();

//creating a post 
postRouter.post('/post/create',isAuthenticated, createPost);
//like and dislike post
postRouter.get('/post/:id',isAuthenticated, likeUnlikePost);
//add comment
postRouter.post('/post/:id',isAuthenticated, addAComment);
//delete post
postRouter.delete('/:id',isAuthenticated, deletePost);
//get following posts
postRouter.get('/posts',isAuthenticated, getPostOffFollowing);
//update posts
postRouter.put('/post/:id',isAuthenticated, updatePost);



module.exports= postRouter;


