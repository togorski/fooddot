const path = require("path")

const express = require("express")
const app = express()

const methodOverride = require('method-override')

const server = require("http").createServer(app)
const io = require("socket.io")(server)

const middleware = require("./middleware")
const fs = require('fs')

var session = require('express-session')
var cookieParser = require('cookie-parser')

const bodyParser = require("body-parser")
const Handlebars = require("hbs")

Handlebars.registerHelper("not", function(obj) {
    return !obj;
})

Handlebars.registerHelper("equals", function(a, b) {
    return a === b;
})

const flash = require("connect-flash")

const port = process.env.PORT || 4000
const publicPath = path.join(__dirname, "../public")
const viewsPath = path.join(__dirname, "../templates/views")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "hbs")
app.set("views", viewsPath)
var sidebarTemplate = fs.readFileSync(viewsPath + '/partials/sidebar-admin.hbs', 'utf8');
Handlebars.registerPartial("sidebar-admin", sidebarTemplate)

// db + models
require('dotenv').config()
require("./db/mongoose")
const User = require("./models/user")

// passport - authorisation
const passport = require("passport")
const localStrategy = require("passport-local")

app.use(session({
    secret: "kosmos the dog",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 h
    })
)
app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(cookieParser('keyboard cat'))
app.use(flash())

// global middleware
app.use(function(req, res, next){
    res.locals.currentUser = req.user
    res.locals.error = req.flash("error")
    res.locals.success = req.flash("success")
    next();
});

app.use(express.static(publicPath))
app.use(methodOverride('_method'))

// Display Socket
io.on("connection", (socket) => {
    socket.on("orderCreated", (order, callback) => {
        io.emit("newOrder", order)
        callback("Sent to the kitchen")
    })

    socket.on("statusUpdate", (order, callback) => {
        io.emit("orderStatusUpdate", order)
        callback("Status updated")
    })
    // console.log("user connected")
})

const adminRoutes = require("./routes/admin")
const adminAPIroutes = require("./routes/api/admin")

const displayRoutes = require("./routes/display")

const indexRoutes = require("./routes/index")
const ordersAPIroutes = require("./routes/api/orders")

const menuRoutes = require("./routes/menu")
const kitchenRoutes = require("./routes/kitchen")

app.use("/", indexRoutes)
app.use("/admin", adminRoutes)
app.use("/api/admin", adminAPIroutes)
app.use("/api/orders", ordersAPIroutes)
app.use("/display", displayRoutes)
app.use("/menu", menuRoutes)
app.use("/kitchen", kitchenRoutes)

app.get("*", function(req, res) {
    res.render("error", {code: 404, message: "Page not found"})
})

server.listen(port, () => {
    console.log("Server launched")
})

