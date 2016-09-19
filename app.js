var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var ejs = require('ejs');
var ejsmate = require('ejs-mate');
var ejsLocals = require('ejs-locals');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoSessionStore = require('connect-mongo')(session); // passing "session"  as an argument lets the connect-mongo middleware access the sessions

// remote mongoDB connection
var mLab_URI = "mongodb://admin:password@ds139735.mlab.com:39735/nodeloginapp";
mongoose.connect(mLab_URI, function (err) {
    if (err) {
        return err;
    } else {
        app.listen(3000, function () {
            console.log('express connected on port 3000...');
            console.log('mLab mongodb nodeloginapp connected...');
        })
    }
});

// create a mongodb  connection object
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));


//Sessions: use express-session to track  email logins. sessions can track users anonymously
app.use(session({
    // this is a string used to sign the session ID cookie and it is the only required option. it just adds another level of security
    secret: 'somesecretvalue',

    // forces the session to be staved in the session store, regardless of any changes
    resave: true,

    //this would force an uninitialzed session (a new, unmodified session) to be saved in session store
    saveUninitialized: false,

    //store session data in mongo instead of server RAM; sessions deleted on user logout
    store: new MongoSessionStore({
        mongooseConnection: db
    })
}));

// make user._id available to EJS templating engine
app.use(function (req, res, next) {
    // res.locals.currentUser will  be undefined if the user is not logged in
    res.locals.currentUser = req.session.userId;
    next();
});

// parse incoming requests
//  uncomment after placing  favicon in  /public
//app.use(favicon(__dirname, 'public', favicon.ico)));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.engine('ejs', ejsLocals);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); //this might be redundant, given that ejs parses the views folder by default--otherwise this might allow any folder to be designated


// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;