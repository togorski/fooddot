const express = require("express")
const router = new express.Router()

const { isLoggedIn, isClient } = require("../middleware")
const { compareIndexes } = require("../utils")

const MenuCategory = require("../models/menuCategory")

router.get("/", isLoggedIn, isClient, async (req, res) => {
    let menuItems = []

    try {
        const categories = await MenuCategory.find({})
        categories.sort(compareIndexes)

        // console.log(categories)
        for (i=0; i < categories.length; i++){
            let category = {}

            await categories[i].populate({ path: "items" }).execPopulate()

            category.show = categories[i].show

            if (category.show){
                category.items = categories[i].items
                category.categoryName = categories[i].name
                category.categoryId = categories[i]._id
                category.itemsCount = category.items.length

                category.items.sort(compareIndexes)
                menuItems.push(category)                
            }
        }
        
        res.render("menu", {menuItems, categoriesCount: categories.length})
    } catch (e) {
        res.status("500").send(e.message)
    }   
})

module.exports = router