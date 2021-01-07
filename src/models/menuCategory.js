const mongoose = require("mongoose")
const MenuItem = require("./menuItem")

const menuCategorySchema = new mongoose.Schema({
    // index - used for order in display category, unique 
    index: {
        type: Number
    },
    name: {
        type: String,
        unique: true,
        required: true,
        maxlength: 19
    },
    show: {
        type: Boolean,
        default: true
        // required: true
    }
})

menuCategorySchema.virtual("items", {
    ref: "MenuItem",
    localField: "_id",
    foreignField: "category"
})

menuCategorySchema.pre("save", async function(next){
    if(this.isNew) {
        try{
            const itemCount = await this.constructor.find({}).countDocuments()
            this.index = itemCount
        } catch(e){
            console.log(e.message)
            next(e.message) // add handling
        }
    }
    next()
})

menuCategorySchema.pre("remove", async function (next) {
    await MenuItem.deleteMany({ category: this._id })
    next()
})

module.exports = mongoose.model("MenuCategory", menuCategorySchema)