const express = require("express")
const fs = require("fs")
const { isAdmin, isLoggedIn } = require("../middleware")

const MenuItem = require("../models/menuItem")
const MenuCategory = require("../models/menuCategory")
const User = require("../models/user")

const { compareIndexes } = require("../utils")

const path = require("path")
const publicPath = path.join(__dirname, "../../public")
const imgSubPath = "/img/menu/"

const multer = require("multer")

// Set multer storage
const {format} = require('util')
const { Storage } = require("@google-cloud/storage")

// Create new storage instance with Firebase project credentials
const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT_ID,
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
})

// Create a bucket associated to Firebase storage bucket
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET_URL)

// Initiating a memory storage engine to store files as Buffer objects
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024 // files no larger than 5mb
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            req.fileValidationError = "Image format not accepted"
            return cb(undefined, false, new Error("Image format not accepted"))
        }
        return cb(undefined, true)
    }
})

// Commented lines below are for disk/server storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(publicPath + imgSubPath))
//     },
//     filename: function (req, file, cb) {
//         let extArray = file.mimetype.split("/")
//         let extension = extArray[extArray.length - 1]
//         cb(null, file.fieldname + '-' + Date.now() + "." + extension)
//     }
//   })

// const upload = multer({ 
//     storage,
//     limits: {
//         fileSize: 5 * 1024 * 1024 // under 5 mb
//     },
//     fileFilter(req, file, cb) {
//         if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
//             req.fileValidationError = "Image format not accepted"
//             return cb(undefined, false, new Error("Image format not accepted"))
//         }
//         return cb(undefined, true)
//     }
// })

const uploadImageToStorage = (file) => {
    return new Promise((resolve, reject) => {
        console.log(file)
        if (!file) {
            reject('No image file');
        }
        let newFileName = `${Date.now()}_${file.originalname}`
        
        // Create new blob in the bucket referencing the file
        let fileUpload = bucket.file(newFileName)

        // Create writable stream and specifying file mimetype
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        })

        blobStream.on('error', (error) => {
            reject('Something is wrong! Unable to upload at the moment.' + error)
        })

        blobStream.on('finish', () => {
        // The public URL can be used to directly access the file via HTTP.
        const url = format(`https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`)
            resolve(url);
        })

        blobStream.end(file.buffer)
    })
}

const router = new express.Router()

router.get("/", isLoggedIn, isAdmin, (req, res) => {
    res.redirect("/admin/menu")
})

router.get("/menu", isLoggedIn, isAdmin, async (req, res) => {
    let menuItems = []

    try {
        const categories = await MenuCategory.find({})
        categories.sort(compareIndexes)

        // console.log(categories)
        for (i=0; i < categories.length; i++){
            let category = {}

            await categories[i].populate({ path: "items" }).execPopulate()

            category.items = categories[i].items
            category.categoryName = categories[i].name
            category.categoryId = categories[i]._id
            category.show = categories[i].show

            category.items.sort(compareIndexes)
            menuItems.push(category)
        }
        
        res.render("menu-admin", {menuItems, categoriesCount: categories.length})
    } catch (e) {
        res.render("error", {code: 500, message: e.message})
    }   
})

router.get("/users", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const users = await User.find({})
        
        res.render("users-admin", {users})
    } catch (e) {
        res.render("error", {code: 500, message: e.message})
    }   
})

router.post("/users", isLoggedIn, isAdmin, (req, res) => {
    // is this route ok? should I add try catch or callback with err is enough?
    var newUser = new User({ 
        username: req.body.username,
        displayName: req.body.displayName,
        role: req.body.role
    })
    
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            console.log(err)
            req.flash("error", "Failed to create user. Error message: "  + err.message)
        } else {
            // console.log("success")
            req.flash("success", "User " + newUser.username + " created successfully")
        }

        res.redirect("/admin/users")
    })

    // res.redirect("/admin/users")
})

router.patch("/users/:id", isLoggedIn, isAdmin, async (req, res) => {
    const _id = req.params.id
    const password = req.body.password

    delete req.body.password

    try {
        let user = await User.findById(_id)
        user.set( {...req.body})

        if(password) {
            await user.setPassword(password)
        }

        await user.save()

        req.flash("success", "User data updated")
        res.redirect("/admin/users")
    } catch (e) {
        req.flash("error", e.message)
        res.redirect("/admin/users")
    }
})

router.delete("/users/:id", isLoggedIn, isAdmin, async (req, res) => {
    const _id = req.params.id

    try {
        await User.findOneAndDelete({ _id })
        req.flash("success", "User deleted successfully")
    } catch (err) {
        req.flash("error", err.message)
    }

    res.redirect("/admin/users")
})

router.post("/menu/items", isLoggedIn, isAdmin, upload.single("photo"), async (req, res) => {
    req.body.vegan      ? req.body.vegan = true      : req.body.vegan = false
    req.body.vegetarian ? req.body.vegetarian = true : req.body.vegetarian = false
    req.body.glutenFree ? req.body.glutenFree = true : req.body.glutenFree = false
    req.body.available  ? req.body.available = true  : req.body.available = false
    // if (req.body.vegan) { req.body.vegan = true } else { req.body.vegan = false }
    // if (req.body.vegetarian) { req.body.vegetarian = true } else { req.body.vegetarian = false }
    // if (req.body.glutenFree) { req.body.glutenFree = true } else { req.body.glutenFree = false }
    // if (req.body.available) { req.body.available = true } else { req.body.available = false }
    
    req.body.price = parseFloat(req.body.price.replace(",",".")).toFixed(2)
    // console.log(this.price)
    
    let itemData = new MenuItem({ ...req.body })

    // below 'if' is for disk storage
    // if (req.file) { itemData.image = imgSubPath + req.file.filename }

    try {
        if (req.file) {
            if (req.fileValidationError) {
                throw new Error(req.fileValidationError)
            }
            itemData.image = await uploadImageToStorage(req.file)
        }

        await MenuCategory.updateOne(
            { _id: req.body.categoryId },
            { $push: { items: itemData }}
        )
        await itemData.save()
        req.flash("success", "Item " + itemData.name + " created successfully")
    } catch (e) {
        req.flash("error", "Failed to create item " + itemData.name + ". " + e.message)
    }

    res.redirect("/admin/menu")
})

router.put("/menu/items/:id", isLoggedIn, isAdmin, upload.single("photo"), async (req, res) => {
    // can be optimized to updated as patch, only keys that were changed
    
    const _id = req.params.id

    req.body.vegan      ? req.body.vegan = true      : req.body.vegan = false
    req.body.vegetarian ? req.body.vegetarian = true : req.body.vegetarian = false
    req.body.glutenFree ? req.body.glutenFree = true : req.body.glutenFree = false
    req.body.available  ? req.body.available = true  : req.body.available = false

    req.body.price = parseFloat(req.body.price.replace(",",".")).toFixed(2)

    let itemData = req.body

    // uncomment for disk storage
    // if (req.file) { itemData.image = imgSubPath + req.file.filename }

    delete itemData.id;

    try {
        if (req.file) {
            if (req.fileValidationError) {
                throw new Error(req.fileValidationError)
            }
            itemData.image = await uploadImageToStorage(req.file)
        }

        const editedItem = await MenuItem.findById({_id})
        if (editedItem.category != itemData.category) {
            const remainingItems = await MenuItem.find({
                category: editedItem.category,
                index: { $gt: editedItem.index}
            })

            for(i=0; i < remainingItems.length; i++){
                remainingItems[i].index = editedItem.index + i
                await remainingItems[i].save()
            }

            const newIndex = await MenuItem.countDocuments({category: itemData.category})
            itemData.index = newIndex
        }

        await MenuItem.updateOne({ _id }, { $set: {
            ...itemData
        }}, { runValidators: true })
        await MenuItem.updateOne({ _id }, { $set: {
            ...itemData
        }}, { runValidators: true })
        // remove old image - below works for disk storage
        // if (req.file){
        //     try {
        //         fs.unlinkSync(publicPath + editedItem.image)
        //         //file removed
        //     } catch(err) {
        //         //what else can be a handling here?
        //         console.error(err)
        //     }
        // }
        
        req.flash("success", "Item " + itemData.name + " edited successfully")
    } catch (e) {
        req.flash("error", "Failed to edit item " + itemData.name + ". " + e.message)
        console.log(e.message)
    }

    res.redirect("/admin/menu")
})

router.post("/menu/categories", isLoggedIn, isAdmin, async (req, res) => {
    // put it as new item
    // if (req.body.show) { req.body.show = true } else { req.body.show = false }
    req.body.show ? req.body.show = true : req.body.show = false

    const newCategory = new MenuCategory({ ... req.body})

    try {
        await newCategory.save()
        req.flash("success", "Category " + req.body.name + " created successfully")
    } catch (e) {
        req.flash("error", "Failed to create category " + req.body.name + ". " + e.message)
    }

    res.redirect("/admin/menu")

})

router.delete("/menu/categories/:id", isLoggedIn, isAdmin, async (req, res) => {
    const id = req.params.id

    try {
        const category = await MenuCategory.findById(id)
        await category.remove()

        req.flash("success", "Category deleted successfully")
    } catch (e) {
        req.flash("error", "Failed to delete category. " + e.message)
    }

    res.redirect("/admin/menu")
})

router.delete("/menu/items/:id", isLoggedIn, isAdmin, async (req, res) => {
    const id = req.params.id

    try {
        const deletedItem = await MenuItem.findByIdAndDelete(id)
        const deletedIndex = deletedItem.index
    
        const remainingItems = await MenuItem.find({
            category: deletedItem.category,
            index: { $gt: deletedItem.index}
        })

        for (i=0; i < remainingItems.length; i++){
            remainingItems[i].index = deletedIndex + i
            await remainingItems[i].save()
        }
        req.flash("success", "Item " + deletedItem.name + " deleted successfully")
    } catch (e) {
        req.flash("error", "Failed to delete item " + deletedItem.name + ". " + e.message)
    }

    res.redirect("/admin/menu")
})

router.put("/menu/categories/:id", isLoggedIn, isAdmin, async (req, res) => {
    // can be optimized to updated as patch, only keys that were changed
    const _id = req.params.id
    const name = req.body.name
    let show = req.body.show

    if (show) { show = true } else { show = false }

    try {
        await MenuCategory.updateOne({ _id }, { $set: { name, show } }, { runValidators: true })

        req.flash("success", "Category " + name + " updated successfully")
    } catch (e) {
        req.flash("error", "Failed to update " + name + ". " + e.message)
        console.log(e.message)
    }

    res.redirect("/admin/menu")
})

module.exports = router