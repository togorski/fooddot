const mongoose = require("mongoose")

const menuItemSchema = new mongoose.Schema({
    // index - used for order in display category, unique 
    index: {
        type: Number
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        maxlength: 115
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuCategory",
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String
    },
    available: {
        type: Boolean,
        default: true,
        required: true
    },
    vegan: {
        type: Boolean,
        default: false,
        required: true
    },
    vegetarian: {
        type: Boolean,
        default: false,
        required: true
    },
    glutenFree: {
        type: Boolean,
        default: false,
        required: true
    },
    available: {
        type: Boolean,
        default: true,
        required: true
    }
})

menuItemSchema.pre("save", async function(next){
    if(this.isNew) {
        // console.log(this.isNew)
        try{
            const itemCount = await this.constructor.find({category: this.category}).countDocuments()
            this.index = itemCount
        } catch(e){
            console.log(e.message)
            next(e.message) // add handling
        }
    }
  
    next()
})

menuItemSchema.statics.checkAvailableById = async function(_id) {
    let foundItem = await MenuItem.findById(_id)
    
    if (!foundItem) {
        throw new Error ("Item not found")
    }

    return foundItem.available
}

const MenuItem = mongoose.model("MenuItem", menuItemSchema)
module.exports = MenuItem