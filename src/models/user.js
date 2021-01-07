const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        maxlength: 15
    },
    displayName: {
        type: String,
        unique: true,
        required: true,
        minlength: 3,
        maxlength: 15
    },
    role: {
        type: String,
        enum: ["kitchen", "client", "admin", "display"],
        required: true
    }
})

const myPasswordValidator = function(password, cb) {
    if (!(password.length >= 5 && password.length <= 10)) {
        return cb({message: "Password should contain between 5 and 10 characters"});
    }
    return cb(null);
}

userSchema.plugin(passportLocalMongoose, {
    usernameLowerCase: true,
    passwordValidator: myPasswordValidator
})

userSchema.pre("findOneAndDelete", async function(next) {
    const _id = this.getQuery()._id
    
    // Check if user to be deleted is an admin - disable operation if it's current user or the is only 1 admin account left
    const adminUsers = await User.find({ role: "admin"})

    const foundUser = adminUsers.find(user => {
        return user._id.toString() === _id})

    // user is not an admin, so nevermind
    if(!foundUser) {
        return next()
    }

    if(adminUsers.length <= 1) {
        var err = new Error("Can't delete - at least 1 admin account needed")
        return next(err)
    }

    return next()
})

var User = mongoose.model("User", userSchema)
module.exports = User