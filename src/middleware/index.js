var middlewareObj = {}

// Routes
middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    
    res.redirect("/login")
}

middlewareObj.isAdmin = function(req, res, next) {
    if (req.user.role === "admin") {
        return next()
    }
    res.render("error", {code: 401, message: "You are not authorized"})
}

// should I add admin as a separate check here or as a second middleware?
middlewareObj.isClient = function(req, res, next) {
    if (req.user.role === "client" || req.user.role === "admin") {
        return next()
    }
    res.render("error", {code: 401, message: "You are not authorized"})
}

middlewareObj.isDisplay = function(req, res, next) {
    if (req.user.role === "display" || req.user.role === "admin") {
        return next()
    }
    res.render("error", {code: 401, message: "You are not authorized"})
}

middlewareObj.isKitchen = function(req, res, next) {
    if (req.user.role === "kitchen" || req.user.role === "admin") {
        return next()
    }
    res.render("error", {code: 401, message: "You are not authorized"})
}

module.exports = middlewareObj