require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const expresslayout = require('express-ejs-layouts')
const path = require('path')
const app = express()
const flash = require('express-flash')
const PORT = process.env.PORT || 3301
const mongoose = require('mongoose')
const session = require('express-session')
const { collection } = require('./app/models/menu')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')

//Database connection
const url = 'mongodb://localhost/pizza';
mongoose.connect(url, {useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology:true,
useFindAndModify:true});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('Database connected...');
}).catch(err => {
    console.log('Connction fail...')
});



//Session store
let mongoStore = new MongoDbStore({
        mongoUrl : url,
        collection: 'sessions'
    })
//Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24} // 24 hours

}))

// Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//Assets
app.use(express.static('public'))
//Global middleware 
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})
// set Template engine
app.use(expresslayout)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)



app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
})