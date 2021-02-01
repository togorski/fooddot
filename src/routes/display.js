const express = require("express")
const router = new express.Router()

const Order = require("../models/order")

const { isLoggedIn, isDisplay } = require("../middleware")

const statusOrder = ["Ready", "Preparing", "Pending"]

const sortOrders = (a, b) => {return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)}

router.get("/", isLoggedIn, isDisplay, async (req, res) => {
    
    try {
        const orders = await Order.find({ status: {$in: ["Ready", "Preparing", "Pending"]}}, "_id orderNumber status")
        orders.sort(sortOrders)

        res.render("order-display", { orders })
    } catch (e) {

    }
})

module.exports = router