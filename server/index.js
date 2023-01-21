const express = require('express');
const cookie= require('cookie-parser')
const mongoose = require('mongoose');
const postRouter = require('./route/PostRoute');
const userRouter = require('./route/UserRoute');
const fileupload = require('express-fileupload');
const app = express();

require("dotenv").config({ path: "config/config.env" })

//MiddleWares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookie())
app.use(fileupload({
    useTempFiles:true
}))

mongoose.connect(process.env.MONGO_KEY)
    .then(() => console.log('mongoDB running'))
    .catch((err) => console.log(err))


app.use('/', postRouter);
app.use('/', userRouter);

app.listen(process.env.PORT, () => {
    console.log('App listening on port ' + process.env.PORT);
})