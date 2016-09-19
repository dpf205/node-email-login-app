var mongoose = require('mongoose');
var bcrypt = require('bcrypt'); //bcrypt provides a method for creating both a hash and a  salt


var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    favoriteSubject:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
        trim: true // no prepended or appended spaces
    }
});

// authenticate user login input against database documents
// in  mongoose, the "statics" object lets you add methods directly to the model
// this method can be called in other files, like the routes file
UserSchema.statics.authenticate = function (email, password, callback) {
        // note: "callback" will either login user or give an "unauthorised user" error

    //tell mongoose to set up a query to find the document with the user's email address
    User.findOne({email:email})
        .exec(function(error,user){
            if(error){
                return callback(error);
            }else if(!user){
                var err =  new Error('User not found');
                err.status = 401;
                return callback(err);
            }
            //use brypt's compare() method to compare the password input by the user with the hashed version
            //it takes 3 inputs: a plain text password ("password") the user types into the login form,
            // the hashed version ("user.password") and the callback ("function (error, result)...")
            // an error, "true" if the passwords match, and "false" if they do  not
            bcrypt.compare(password, user.password,  function (error, result) {
                if(result ===  true){
                    return callback(null,user);
                }else{
                    return callback();
                }
            })
        });
}

//hash password with mongo's pre-save hook, a function mongo runs before saving info  to database
UserSchema.pre('save', function(next){

    var user = this;  //in this context, mongo's pre-save hook function assigns data to the "this"  keyword

    //apply encryption process 10 times; the greater the number, the slower the process and the greater the security
    //replace the plaintext password with the hash value
    bcrypt.hash(user.password, 10, function(err,hash){
        if(err){
            return next(err);
        }
        user.password =  hash;
        next();
    })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;

