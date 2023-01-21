const express = require('express');
const { CreateUserAccount, LoginUser, followUser, checkActiveUsers, logout, updatePasskey, updateProfile, deleteUserProfile, getProfile, profileAvatar, getAllusers, mostLikedPost } = require('../controller/UserController');
const { isAuthenticated } = require('../middlewares/authenticate');


const userRouter = express.Router();

//register
userRouter.post('/user/register', CreateUserAccount);
//login
userRouter.post('/user/login', LoginUser);
//get profile
userRouter.get('/user/profile', isAuthenticated, getProfile);
//update passkey
userRouter.put('/user/passkey', isAuthenticated, updatePasskey);
//update profile
userRouter.put('/user/profile', isAuthenticated, updateProfile);
//delete profile
userRouter.delete('/user/profile', isAuthenticated, deleteUserProfile);
//follow the users
userRouter.get('/user/follow/:id', isAuthenticated, followUser);
//logout
userRouter.get('/user/logout', logout);
//for admin 
userRouter.get('/users/all',getAllusers);
//most liked post
userRouter.get('/user/mostlikedpost',isAuthenticated, mostLikedPost);
//check active status 
userRouter.get('/active', isAuthenticated, checkActiveUsers);
//avatar
userRouter.post('/avatar',isAuthenticated, profileAvatar);
  

module.exports = userRouter;


