// Importing required modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
var registration = require('./bin/models/registration'); // Ensure this path is correct
var BloodDonation=require('./bin/models/donateB.js');


// Initialize Express app
var app = express();
app.use(cors()); 

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB:", err);
  });

// Middleware setup
app.use(logger('dev'));
app.use(express.json()); // Parse incoming JSON data
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// POST route to handle registration
app.post('/createregister', function (req, res) {
  console.log("Request received with body:", req.body); // Debug log

  // Validate incoming data
  if (!req.body.fullName || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  let newUser = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    dateOfBirth: req.body.dateOfBirth,
    contactInfo: req.body.contactInfo,
    username: req.body.username, // Ensure this is coming from the client
    gender: req.body.gender,
    location: req.body.location
  };

  // Create and save new user in MongoDB
  let userRegistration = new registration(newUser);

  userRegistration.save()
    .then(() => {
      console.log("User registered successfully:", newUser); // Debug log
      res.status(201).json({
        message: "Registration successful",
        user: newUser
      });
    })

    .catch(err => {
      console.error("Error during registration:", err); // Log error details
      res.status(500).json({ message: "Registration failed", error: err.message });
    });
});

app.post('/getlogin', function(req, res) {
  const { username, password } = req.body; 
  registration.findOne({ username: username, password: password })
    .then(user => {
      if (user) {
        res.status(200).json({ message: 'Login successful', success: true });       } else {
        res.status(401).json({ message: 'Invalid credentials', success: false });   }
    })
    .catch(err => {
      res.status(500).json({ message: 'Server error', success: false });
    });
});


app.post('/createdonar',function(req,res){
  let A={ 
    fullName:req.body.fullName,
    
  age:req.body.age,
  gender:req.body.gender,
  bloodGroup: req.body.bloodgroup,
  email: req.body.email,
  disease:req.body.disease,
  place:req.body.place,
  username:req.body.username,
  password:req.body.password,
  contactnumber:req.body.contactnumber

  }
  let u=new BloodDonation(A);
  u.save().then(()=>{
    res.json({
      A:"kiran",
    })
    res.send("created")
  }).catch(err=>{
    res.send("failed")
  })
});

app.post('/searchDonor', function(req, res) {
  let searchCriteria = {
    place: req.body.place,
    bloodGroup: req.body.bloodGroup
  };

  BloodDonation.find(searchCriteria, {
    fullName: 1,
    age: 1,
    gender: 1,
    place: 1,
    bloodGroup: 1,
    contactnumber:1
    // Exclude password, email, and other sensitive info
  }).then((donors) => {
    if (donors.length > 0) {
      res.json({
        success: true,
        donors: donors
      });
    } else {
      res.json({
        success: false,
        message: "No donors found"
      });
    }
  }).catch(err => {
    res.status(500).send({
      success: false,
      message: "Failed to search donors",
      error: err
    });
  });
});

// Importing required modules
//const BloodDonation = require('./models/BloodDonation'); // Your existing Mongoose model

// Route to get all donors
app.get('/donors', (req, res) => {
    BloodDonation.find({}, { fullName: 1, email: 1, bloodGroup: 1, place: 1 ,contactnumber:1 })
        .then(donors => res.json(donors))  // Returning the donor data
        .catch(err => res.status(500).json({ error: "Failed to retrieve donors", details: err }));
});


// Catch 404 errors and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
