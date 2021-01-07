const express = require("express")
const router = new express.Router()

const MenuItem = require("../../models/menuItem")
const Order = require("../../models/order")

const { isClient, isKitchen, isLoggedIn } = require("../../middleware/apiMiddleware")

router.post("/", isLoggedIn, isClient, async (req, res) => {
    // console.log(req.body)
    try {
        let items = req.body
        // console.log(items)
        let promisesArr = []
        let notAvailableItems = []

        if (!items.length) {
            return res.send({ success: false, error: "Nothing was ordered"})
        }

        items.forEach((orderedItem) => {
            promisesArr.push(MenuItem.checkAvailableById(orderedItem.item))
        })
        
        Promise.all(promisesArr).then(async response => {
            for (i=0; i < items.length; i++) {
                // console.log(response[i])
                if (!response[i]) notAvailableItems.push(items[i])
                // console.log("promise loop: " + notAvailableItems)
            }
    
            if (notAvailableItems.length) {
                return res.send({ success: false, error: "Some items out of stock", notAvailableItems })
            }
    
            let incomingOrder = new Order({
                status: "Pending",
                items,
                totalPrice: 100
            })
    
            let createdOrder = await incomingOrder.save()
            // console.log(savedOrder)
            res.send({ success: true, orderNumber: createdOrder.orderNumber, message: "Order Submitted"})
        })
    } catch (error) {
        console.log(error.message)
        return res.send({ success: false, error: error.message})
    }
})

router.patch("/changeStatusById", isLoggedIn, isKitchen, async (req, res) => {
    // console.log(req.body)
    try {
        let foundOrder = await Order.findOne({_id: req.body.id })

        // check if something was found, if not - return exception 
        if(foundOrder) {
            foundOrder.status = req.body.status
            await foundOrder.save()
            return res.send({ success: true, message: "Order status updated"})
        } else {
            return res.send({ success: false, error: "Order not found"})
        }
        
    } catch (error) {
        return res.send({ success: false, error: error.message})
    }
})

module.exports = router