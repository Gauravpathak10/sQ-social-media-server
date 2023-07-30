const cloudinary = require('cloudinary').v2;


// Configuration 
cloudinary.config({
    cloud_name: "your_name",
    api_key: "your_api_key",
    api_secret: "your_api_key_secret"
});

module.exports = cloudinary;

