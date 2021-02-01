const mongoose = require("mongoose")

// mongoose.connect("mongodb://127.0.0.1:27017/pos-app", {
const connection = process.env.MONGODB_CONNECTION_STRING
mongoose.connect(connection, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})