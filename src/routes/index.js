const express = require("express")
const router = new express.Router()
const passport = require("passport")

router.get("/", (req, res) => {
    res.redirect("/login")
})

// work on code duplication (switch on get/post)
router.get("/login", async (req, res) => {
    if(req.isAuthenticated()) {
        switch(req.user.role) {
            case "admin":
                res.redirect("/admin/menu")
                break
            case "client":
                res.redirect("/menu")
                break
            case "kitchen":
                res.redirect("/kitchen")
                break
            case "display":
                res.redirect("/display")
                break
            default:
                res.render("login")
        }
    } else {
        res.render("login")
    }
})

router.post("/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: 'Invalid username or password.'
    }), (req, res) => {
        // just render as we don't need middleware
        switch(req.user.role) {
            case "admin":
                res.redirect("/admin/menu")
                break
            case "client":
                res.redirect("/menu")
                break
            case "kitchen":
                res.redirect("/kitchen")
                break
            case "display":
                res.redirect("/display")
                break
            default:
                req.flash("error", "Non existing user role")
                res.render("/login")
        }
    }
)

router.get("/logout", function(req, res) {
    req.logout()
    res.redirect("/")
});

router.get("/error", (req, res) => {
    res.render("error")
})

module.exports = router