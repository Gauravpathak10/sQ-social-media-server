const User = require("../model/UserModel");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const Post = require("../model/PostModel");
const cloudinary = require('../cloud');




//Register UserCredentials
exports.CreateUserAccount = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        if (!userName) return res.json({ message: 'userName is required' })
        if (!email) return res.json({ message: 'email is required' })
        if (!password) return res.json({ message: 'password is required' })
        // Check if this user already exisits
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "User Already Exists",
                status: false
            });
        } else {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            // Insert the new user if they do not exist yet
            user = await User.create({
                userName,
                email,
                avatar: {
                    public_id: 'temp public_id String',
                    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO0zsJMcT0Ud9SbvIEXXNglcUkq1jQHyoT_w&usqp=CAU'
                },
                password: hashedPassword,
            });
            res.status(201).json({
                message: "SuccessFully created",
                status: true,
                data: user
            });
        }
        //Check For Validations & Errors
    } catch (error) {
        res.status(422).json({
            message: error.message,
            status: false,
        });
    }
}
//update User password =>authorization 
exports.updatePasskey = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { oldpassword, newPassword } = req.body;
        const VerifyPassword = await bcrypt.compare(oldpassword, user.password);
        if (!VerifyPassword) {
            res.status(401).json({
                message: "Incorrect Old passkey",
                status: false,

            });
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        user.password = hashedPassword;
        await user.save();
        res.status(201).json({
            message: "passkey updated",
            status: true,
            data: user
        });
    } catch (error) {
        res.status(422).json({
            message: error.message,
            status: false,
        });
    }
}
//update user-profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { userName, email } = req.body;
        if (!userName || !email) {
            res.status(401).json({
                message: "all field required",
                status: false,

            });
        }
        user.userName = userName;
        user.email = email;

        // avatar 
        await user.save();
        res.status(201).json({
            message: "profile updated",
            status: true,
            data: user
        });
    } catch (error) {
        res.status(422).json({
            message: error.message,
            status: false,
        });
    }
}
//checks active users is user is logged In
exports.checkActiveUsers = async (req, res) => {
    try {
        User.find({ isActive: true }, (err, users) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(users);
            }
        });

    } catch (error) {
        res.status(422).json({
            message: error.message,
            status: false,
        });
    }
}


//Login Credentials
exports.LoginUser = async (req, res) => {
    try {
        //validations
        const { email, password, } = req.body;


        if (!email) {
            res.status(422).json({
                status: false,
                message: "Email Required"
            })
        }
        if (!password) {
            res.status(422).json({
                status: false,
                message: "Password Required"
            })
        }
        //Verification
        let users = await User.findOne({ email: email });

        const VerifyPassword = await bcrypt.compare(password, users.password)

        if (users && VerifyPassword) {
            const activeId = JSON.stringify(users._id).split("ObjectId")[0].replace(/['"]+/g, '')
            await User.findByIdAndUpdate(activeId, { isActive: true }, { useFindAndModify: false })
            let token = jwt.sign({ id: users._id }, 'keyforNodereactProject');
            const options = {
                expires: new Date(Date.now() + 90 * 24 * 60 * 1000),
                httpOnly: true
            }
            res.status(200).cookie("token", token, options).json({
                status: true,
                users,
                token
            });
        }

    } catch (error) {
        return res.status(422).json({
            message: "Invalid Credentials",
            serverError: error.message,
            status: false,
        });
    }

}

//follow
exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);

        if (!userToFollow) {
            res.status(404).json({
                message: "user not found",
                status: false,
            });
        }
        if (loggedInUser.following.includes(userToFollow._id)) {
            const indFollow = loggedInUser.following.indexOf(userToFollow._id);
            const indFollowing = userToFollow.followers.indexOf(loggedInUser._id);

            loggedInUser.following.splice(indFollow, 1);

            userToFollow.followers.splice(indFollowing, 1);

            await loggedInUser.save();
            await userToFollow.save();
            res.status(201).json({
                message: "user unfollowed",
                status: true,
            });
        }
        else {
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();
            res.status(201).json({
                message: "user followed",
                status: true,
            });

        }
    } catch (error) {
        res.status(422).json({
            message: error.message,
            status: false,
        });
    }
}


exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('posts');
        return res.status(201).json({
            status: true,
            message: "user credentials",
            data: user
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }
}
//delete user
exports.deleteUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers = user.followers;
        const following = user.following;
        await user.remove();

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
        })
        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);
            await post.remove()
        }
        //remove followers
        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);
            const ind = follower.following.indexOf(user._id);
            follower.following.splice(ind, 1);
            await follower.save()

        }
        //remove follllowing
        for (let i = 0; i < following.length; i++) {
            const follows = await User.findById(following[i]);
            const ind = follows.followers.indexOf(user._id);
            follows.following.splice(ind, 1);
            await follows.save()

        }


        return res.status(201).json({
            status: true,
            message: "user deleted"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }
}
//logout
exports.logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        const loggeoutUser = await User.findOneAndUpdate({ token })
        const activeId = loggeoutUser._id
        await User.findByIdAndUpdate(activeId, { isActive: false }, { useFindAndModify: true })
        res.status(200).cookie("token", null, { expires: new Date(Date.now()), httpOnly: true }).json({
            status: true,
            message: "logged out"
        })
    } catch (error) {
        res.status(422).json({
            message: error.message,
            status: false,
        });
    }
}

// avatar;
exports.profileAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "no user found"
            })
        }
        const file = req.files.avatar
        const data = await cloudinary.uploader.upload(file.tempFilePath)
        if (data) {
            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                {
                    avatar: {
                        public_id: data.public_id,
                        url: data.secure_url
                    }
                },
                { new: true }
            );

            return res.status(201).json({
                status: true,
                message: "avatar changed",
                data: updatedUser
            })
        }


    } catch (error) {
        res.status(422).json({
            message: error.message,
            status: false,
        });
    }
}

//for Admin dashboard
exports.getAllusers = (req, res) => {
    User.find({}, function (err, data) {
        if (err) {
            res.status(422).json({
                message: "UnSucessfully ",
                status: false
            })
        }
        else {
            res.status(200).json({
                message: "SuccessFully got",
                status: true,
                data: data
            })
        }
    })
}

// mostLikedPost
exports.mostLikedPost = async (req, res) => {
    const user = req.user._id
    const verifyifUserPost = JSON.stringify(user._id).split("ObjectId")[0].replace(/['"]+/g, '');
    try {
        const posts = await Post.find({});
        const sum = 0
        const add = []
        for (let i = 0; i < posts.length; i++) {
            const a = posts[i].likes.length
            add.push(sum + a)
        }
        const check = add.sort(function (a, b) { return b - a });
        // console.log(check[0]);
        const final = posts.filter((list) => {
            return list.likes.length == check[0]
        });
        const postOwnerId = JSON.stringify(final[0].owner).split("ObjectId")[0].replace(/['"]+/g, '');
        if (verifyifUserPost == postOwnerId) {
            return res.status(200).json({
                message: "congrats you have the most liked post",
                status: true,
                data: final,
            })
        }
        else {
            return res.status(200).json({
                message: "this is the most liked post",
                status: true,
                data: final,
            })
        }

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        })
    }
}


