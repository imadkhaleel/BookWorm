// Required modules //
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const fs = require('fs');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv');

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Set up HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// Add data models used

const { authorModel } = require("./models/Author");
const { roleModel } = require("./models/Role");
const { userModel } = require("./models/User");
const { eBookModel } = require("./models/Ebook");
const { genreModel } = require("./models/Genre");
const { catalogModel } = require("./models/Catalog");

//Set up .env file

const path = require("path");
const rootDir = path.resolve(__dirname, ".");
const env = require("dotenv").config({ path: `${rootDir}/.env` }).parsed;
if (!env) {
  console.log(env);
  console.log("Environment variables file not found");
}

const port = process.env.PORT || env["PORT"] || 5000;

//Connect to mongoDB

const dbConnectionUri =  env["DB_CONNECTION_STRING"] || "mongodb://localhost:27017/bookworm";
console.log(`Connecting to MongoDB at ${dbConnectionUri}`);

connectDB(dbConnectionUri);

//Additional Setup

app.use(express.json());

//app.use(logger);
app.use(cors(corsOptions));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


// User schema and model NEED TO MODIFY WITH ALL DATA
const customerFullSchema = new mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  age: String,
  userType: String,
  email: String,
  password: String,
  readingList: String,
});

const Customer = mongoose.model('Customer', customerFullSchema);

// Passport configuration
const initializePassport = require('./passport-config');
const users = [];
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

// Initialize app
const app = express();

// Middleware
app.set('view-engine', 'ejs');
app.use('/public', express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Set up routes

app.use("/", require("./routes/api/Root"));
//app.use("/catalog", require("./routes/api/Catalog.js"));
app.use("/login", require("./routes/api/Login"));
app.use("/logout", require("./routes/api/Logout"));



//routes 
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        name: req.user.name,
        lastname:req.user.lastName,
        email: req.user.email,
        id: req.user.id
    });
});

  
app.get('/login', checkNotAuthenticated, (req, res) => {
     res.render('login.ejs')
})
  
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})


Customer.find({}, function(err, customers) {
    if (err) {
      console.log(err);
    } else {
      // Iterate over the documents and push each document's data to the users array
      customers.forEach(function(customer) {
        users.push({
          id: customer.id,
          name: customer.firstName,
          lastName: customer.lastName,
          age: customer.age,
          userType: customer.userType,
          email: customer.email,
          password: customer.password,
          readingList: customer.readingList,
          _id: customer._id
        });
      });
    }
});

  
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const user_temp = new Customer({

        id: Date.now().toString(),
        firstName: req.body.name,
        lastName: req.body.lastname,
        age: req.body.age,
        userType: "Member",
        email: req.body.email,
        password: hashedPassword,
        readingList: "Empty"
    
    })
    user_temp.save();

    users.push({
        id: Date.now().toString(),
        name: req.body.name,
        lastName: req.body.lastname,
        age: req.body.age,
        userType: "Member",
        email: req.body.email,
        password: hashedPassword,
        readingList: "Empty",
        _id: 1

    })
console.log(users);
      res.redirect('/login')
    } catch {
      res.redirect('/register')
    }
  })

  
  
app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/login');
    });
});



//functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
  }
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
  
