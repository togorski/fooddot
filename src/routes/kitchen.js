const express = require("express")
const router = new express.Router()

const { isLoggedIn, isKitchen } = require("../middleware")

const moment = require("moment")
const Order = require("../models/order")

router.get("/", isLoggedIn, isKitchen, async (req, res) => {
    try {
        let readyOrders = []
        let preparingOrders = []
        let pendingOrders = []

        let orders = await Order.find({ status: {$in: ["Ready", "Preparing", "Pending"]}}, "_id orderNumber items status createdAt").populate("items.item", "name").exec()
        
        orders.forEach((order, i) => {
            orders[i].createdAtFormatted = moment(orders[i].createdAt).format("HH:mm")
            // console.log(orders[i])
            if (orders[i].status === "Ready") {
                readyOrders.push(orders[i])
            } else if (orders[i].status === "Preparing") {
                preparingOrders.push(orders[i])
            } else if (orders[i].status === "Pending") {
                pendingOrders.push(orders[i])
            }
        })
        
        orders = [
            { status: "ready", ordersArray: readyOrders },
            { status: "preparing", ordersArray: preparingOrders },
            { status: "pending", ordersArray: pendingOrders },
        ]
        // console.log(readyOrders)
        res.render("kitchen", { orders })
        // res.render("kitchen", { readyOrders, preparingOrders, pendingOrders })
    } catch (e) {
        res.send(e.message)
    }
})

module.exports = router