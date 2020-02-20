const express = require('express')
const app = express()
const session =require('express-session')
const User = require('./models/Users')
const randomUser = require('./models/randomUser')
const MongoStore = require('connect-mongo')(session)
const logger = require('morgan')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const path = require('path')
const bcrypt = require('bcrypt')
const flash =require('connect-flash')
const {check, validationResult } = require('express-validator');
const passport = require('passport')
require('dotenv').config()
require('./lib/passport')
const port = process.env.Port || 3000
//app.use(express.static(path.join(__dirname,'views')))
// app.use(express.static(path.join(__dirname,'models')))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(()=>{
    console.log('Mongodb Connected')
}).catch(err=> console.log(`mongo error:${error}`))
app.use(session({
    resave:true,
    saveUninitialized:true,
    secret:process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        mongooseConnection:mongoose.connection,
        autoReconnect:true
    }),
    cookie:{
        secure:false,
        maxAge:600000,
    }
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use((req,res,next)=>{
    res.locals.user = req.user
    res.locals.errors = req.flash('errorMessage')
    res.locals.success = req.flash('successMessage')
    next()
})
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.get('/',(req,res)=>{
    return res.render('index')
})
app.get('/register',(req,res)=>{
    return res.render('register')
})
app.get('/login',(req,res)=>{
    return res.render('login')
})
app.get('/loggedIn',(req,res)=>{
    if(req.isAuthenticated) {
        return res.render('loggedIn')
    }
    return res.redirect('/login')
})
app.get('/registered',(req,res)=>{
    if(req.isAuthenticated){
        return res.render('registered')
    }
    return res.redirect('/register')
})

app.get('/option', (req, res) => {
    return res.render('option', )
})

app.get('/randomUser', (req, res) => {
    return res.render('randomUser', {randomUser})
})



app.post('/register',[check('name', 'Name is required').not().isEmpty(),check('email', 'Please include a valid email').isEmail(),check('password', 'Please include valid password').isLength({min:3})],(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return res.render('register', { errors: 'All Inputs Must be filled' })
    }                                                                      
    User.findOne({email:req.body.email}).then((user)=>{
        if(user){
           return console.log('user exists')
        } else {
            const user = new User()
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(req.body.password,salt)
            user.name = req.body.name
            user.email = req.body.email
            user.password =  hash
            user.save().then(user=>{
                req.login(user,(err)=>{
                    if(err){
                        return res.status(500).json({message:'server error'})
                    }else{
                        return res.redirect('/registered')
                        //next()
                    }
                })
                // return res.status(200).json({message: 'User create',user})
            }).catch(err=>console.log(err))
        }
    })
})
app.post('/login', passport.authenticate('local-login',{
    successRedirect:'/loggedIn',
    failureRedirect:'/login',
    failureFlash:true
}))

app.get('/logout', (req,res) =>{
    if(req.user === undefined) {
        req.flash('successMessage','No one to log out')
        return res.redirect('/')
    }
    req.logout();
    req.flash('successMessage', 'You are now logged out');
    return res.redirect('/');
});

//flash tests
app.get('/flash',(req,res)=>{
    return res.render('flash',{message:req.flash('info')})
})
app.get('/single-flash',(req,res)=>{
    req.flash('info','HI single flash')
    return res.redirect('/flash')
})
app.get('/no-flash',(req,res)=>{
     return res.redirect('/flash')
})
app.get('/multiple-flash',(req,res)=>{
    req.flash('info',['message1','message2'])
    return res.redirect('flash')
})

app.listen(port, () => {
    console.log('Connected to ', port)
}
)
