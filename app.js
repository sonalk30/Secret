//jshint esversion:6

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//*** usage of express session ***
// setting up the session
//telling the app to use the session package
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

//telling our app to use passport package
// *** initilazing the passport package ***
// also use passport for dealing with the session
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

//****************** User Schema *****************
// a object that is created from mongoose schema class
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// set up password local mongoose package
// need to add to mongoose schema as a plugin
userSchema.plugin(passportLocalMongoose);

// ************************** MONGOOSE ENCRYPTION ************************

//ENCRYPTING DATABASE using mongoose-encryption package
//use the secret to encrypt the database
//take the schema created above and add mongoose-encrypt as an plugin to our schema and pass over our secret as a javascript object
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });

// **************************************************************************************


//************* Use User Schema to create User Model ***************

const User = new mongoose.model("User", userSchema);

// passport local configuration
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//**** GET request to the root route ****
app.get("/", function(req, res){
  res.render("home");
});

//**** GET request to the login route ****
app.get("/login", function(req, res){
  res.render("login");
});

//**** GET request to the register route ****
app.get("/register", function(req, res){
  res.render("register");
});

//**** GET request to the secrets route ****
app.get("/secrets", function(req, res){
  // inside here we check if the user is authenticated
  // relying on passport, session, passportLocal, passportLocalMongoose
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else {
    res.redirect("/login");
  }
});

//**** GET request for the logout route ****
app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
})

// **** POST request for the register route ****
app.post("/register", function(req, res){
  //passportLocalMongoose package to register the users
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

// **** POST request for the login route ****
app.post("/login", function(req, res){
const user = new User ({
  username: req.body.username,
  password: req.body.password
});
  // now use password to login this user and authenticate them
  req.login(user, function(err){
    if(err) {
      console.log(err);
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(3000, function() {
    console.log("Server started on port 3000.");
});
