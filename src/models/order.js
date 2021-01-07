const mongoose = require("mongoose")
const maxOrderNumber = 99

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"],
        required: true
    },
    items: [{
        amount: {
            type: Number,
            required: true
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MenuItem",
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

orderSchema.pre("validate", async function (next) {
    if (this.isModified("status")) {
        this.status = this.status.toLowerCase().charAt(0).toUpperCase() + this.status.toLowerCase().slice(1)
    }
})

orderSchema.pre("save", async function(next) {
    try {
        if (this.isNew){
            let lastestOrder = await this.constructor.find().sort({_id: -1}).limit(1)

            if (lastestOrder[0]) { 
                if(lastestOrder[0].orderNumber >= maxOrderNumber){
                    this.orderNumber = 1
                } else {
                    this.orderNumber = lastestOrder[0].orderNumber + 1
                }
            }
        }
        next()
    } catch (e) {
        console.log(e.message)
        next(e.message) // add handling
    }
})

module.exports = mongoose.model("Order", orderSchema)