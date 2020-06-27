//jshint esversion:6

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});

//****************** User Schema *****************
// a object that is created from mongoose schema class
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

//ENCRYPTING DATABASE using mongoose-encryption package
//use the secret to encrypt the database
//take the schema created above and add mongoose-encrypt as an plugin to our schema and pass over our secret as a javascript object
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] });


//************* Use User Schema to create User Model ***************

const User = new mongoose.model("User", userSchema);

//**** GET request to the root route ****
app.get("/", function(req, res){
  res.render("home");
});

//**** GET request to the login route ****
app.get("/login", function(req, res){
  res.render("register");
});

//**** GET request to the register route ****
app.get("/register", function(req, res){
  res.render("register");
});

// **** POST request for the register route ****
app.post("/register", function(req, res){
  //create new user using User model
  const newUser = new User({
    //after body. is the value of the name attribute from form on register.ejs
    email: req.body.username,
    password: req.body.password
  });
  //save this new user
  //add a callback function to check for errors
  newUser.save(function(err){
    if(err){
      console.log(err);
    }
    else {
      //if no error render the secrets page
      res.render("secrets");
    }
  });
});

// **** POST request for the login route ****
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  //check the above values in database
  //look through collection of User
  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else {
      if(foundUser){
        if(foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});

app.listen(3000, function() {
    console.log("Server started on port 3000.");
});
