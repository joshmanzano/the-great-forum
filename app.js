const express = require('express')
const cool = require('cool-ascii-faces')
const path = require('path')
const bodyparser = require("body-parser")
const request = require('request')
const hbs = require("hbs")
const session = require("express-session")
const cookieparser = require("cookie-parser")
const PORT = process.env.PORT || 5001
const bcrypt = require("bcrypt")
const fs = require('fs')
const multer = require('multer')
const prettyMs = require('pretty-ms')
const timestamp = require('time-stamp')
const marked = require('marked')
const validator = require('validator')
const mongoose = require("mongoose")
const app = express()

/** SETUP **/

hbs.registerPartials(path.join(__dirname, '/views/partials'))
const urlencoder = bodyparser.urlencoded({
	extended: false
})
/** 
	Connect to mLab Database (heroku_0n46js2x)
    Username: Nine
    Password: trexfire6
    Admin Account:
    Username: heroku_0n46js2x
    Password: kayenicojosh116
**/
mongoose.Promise = global.Promise
mongoose.connect('mongodb://Nine:trexfire6@ds145951.mlab.com:45951/heroku_0n46js2x', {
	useNewUrlParser: true
})

app.use(session({
	saveUninitialized: false,
	resave: true,
	secret: "nicokayejosh",
	name: "Nico's Cookie"
}))

app.use(cookieparser())

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(require("./controllers"))

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))