const mongoose = require("mongoose")

// mongoose.connect("mongodb://127.0.0.1:27017/pos-app", {
const connection = "mongodb+srv://admin:testing123@cluster0.9vjjh.mongodb.net/pos?retryWrites=true&w=majority"
mongoose.connect(connection, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})