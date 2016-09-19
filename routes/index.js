var express = require('express');
var router = express.Router();
var User = require('../models/user');

//requiring a directory by name like this tells express to load the index.js file in that directory
var redirect_LoggedOut_User = require('../middleware');

// GET /profile
router.get('/profile', redirect_LoggedOut_User.requiresLogin, function (req, res, next) {

    //if user is logged in , retrieve the user id from the session store and execute a query against the mongoDB
    User.findById(req.session.userId)
        .exec(function (error, user) {
                if(error){
                    return next(error);
                }else{
                    // obtain all the  user data from the " .exec(function (error, user) {..." user object parameter
                    return res.render('profile', {pagetitle: user.name , name: user.name, favorite: user.favoriteSubject});
                }
        });
});

//GET /logout
router.get('/logout', function (req, res, next) {
    //check if a session object exists and delete the session object
    if(req.session){
        //delete session object
        req.session.destroy(function (err) {
            if(err){
                return next(err);
            }else{
                return res.redirect('/');
            }
        });
    }
});

// GET /login
router.get('/login', redirect_LoggedOut_User.userLoggedOut,  function (req, res, next) {
    res.render('login', {pagetitle: 'Login In' });
});

//POST /login
router.post('/login', function (req, res, next) {
    //check that the user's email and  password are received from the "name" attributes of the login form,
    // via "req.body" property of the request object
    if (req.body.email && req.body.password) {

        // "User" is the model object "var User = require('../models/user') "
        // and "authenticate()" is taken from "UserSchema.statics.authenticate" in models/user.js
        User.authenticate(req.body.email, req.body.password, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                // if the user is authenticated, save the user ID into a session( this is the ID taken from the mongo document for that user)
                //and store the ID into a session. then express creates a cookie containing the session ID and sends it to the browser
                // " req.session.userId  = user._id; " creates a new session or add the property of session data
                // "user" is the mongoDB document containg all the user profile information,etc for a single logged-in user
                // " _id " is the  unique ID mongoDb gives for each document when created in the database
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });
    } else {
        var err = new Error('Email and password are required');
        err.status = 401 // indicates missing or bad information
        return next(err)
    }
})

// GET /register
router.get('/register', redirect_LoggedOut_User.userLoggedOut,  function (req, res, next) {
    return res.render('register', {pagetitle: 'Sign Up'});
});

//POST /register
router.post('/register', function (req, res, next) {
    if (req.body.email &&
        req.body.name &&
        req.body.favoriteSubject &&
        req.body.password &&
        req.body.confirmPassword) {

        // confirm that the user entered the same password both times
        if (req.body.password !== req.body.confirmPassword) {
            var err = new Error('Passwords do not match.'); //outputs error to " <%= message %> " in views/error.ejs
            err.status = 400;
            return next(err);
        }

        // create an object from the data users input into the /register form by accessing the data from the name attribute via req.body.someNameAttribute
        var userData = {
            email: req.body.email,
            name: req.body.name,
            favoriteSubject: req.body.favoriteSubject,
            password: req.body.password
        };

        //use the mongoose Schema "create()" method to insert user data into mongo
        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id; // automatically login user after registration
                return res.redirect('/profile');
            }
        });

    } else {
        var err = new Error('All fields required.'); //outputs error to " <%= message %> " in views/error.ejs
        err.status = 400;
        return next(err);
    }
})

// GET /
router.get('/', function (req, res, next) {
    return res.render('index', {pagetitle: 'LoginApp'});
});

// GET /about
router.get('/about', function (req, res, next) {
    return res.render('about', {pagetitle: 'About'});
});

// GET /contact
router.get('/contact', function (req, res, next) {
    return res.render('contact', {pagetitle: 'Contact'});
});


module.exports = router;


