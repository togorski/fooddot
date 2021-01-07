const express = require("express")
const router = new express.Router()

const { isAdmin, isLoggedIn } = require("../../middleware/apiMiddleware")

const MenuItem = require("../../models/menuItem")
const MenuCategory = require("../../models/menuCategory")



router.patch("/changeMenuItemsOrder", async (req, res) => {
    // console.log(req.body)
    const items = req.body
    if (items.length == 0) {
        return res.send({error: "No items in category"})
    }

    for (i=0; i < items.length; i++) {
        try {
            await MenuItem.findByIdAndUpdate(items[i].id, { $set: {
                index: items[i].index
            }})    
        } catch (error) {
            console.log(error.message)
            return res.send({error: error.message})
        }
    }
    res.send({message: "success"})
})

router.patch("/changeMenuCategoriesOrder", async (req, res) => {
    // console.log(req.body)
    const categories = req.body
    if (categories.length == 0) {
        return res.send({error: "No categories"})
    }
        for (i=0; i < categories.length; i++) {
            try {
                await MenuCategory.findByIdAndUpdate(categories[i].id, { $set: {
                    index: categories[i].index
                }})    
            } catch (error) {
                console.log(error.message)
                return res.send({error: error.message})
            }
        }
        res.send({message: "success"})
})

module.exports = router