// this middleware function redirects logged in users to  /profile, if they attempt to access irrelevant pages like /login or /register
function userLoggedOut(req, res, next) {
    //if both req.session && req.session.userId are true, the user is logged in
    if(req.session && req.session.userId){
        return res.redirect('/profile');
    }
    // if the user is not logged in, just execute the next piece of middleware
    return  next();
}

// this middleware makes it easy to password protect any route in the application
function requiresLogin(req, res, next) {
    if(req.session && req.session.userId){
        return next();
    }else{
        var err = new Error('You must be logged in to view this page');
        err.status = 401;
        return next(err);
    }
}


module.exports.userLoggedOut = userLoggedOut;

module.exports.requiresLogin = requiresLogin;

