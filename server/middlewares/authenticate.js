const User = require("../model/UserModel");
const jwt = require('jsonwebtoken');


exports.isAuthenticated = async (req, res, next) => {

    const { token } = req.cookies;
    try {
        if (!token) {
            return res.status(404).json({
                message: "plz login First",
                status: false
            })
        }
        const decode = await jwt.verify(token, 'keyforNodereactProject')
        req.user = await User.findById(decode.id);
     
        next()
    } catch (error) {
        return res.status(404).json({
            message: error.message,
            status: false
        })
    }
}