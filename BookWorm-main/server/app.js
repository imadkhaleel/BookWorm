
//NPM packages

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt")
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { corsOptions } = require("./config/CorsOptions");
const connectDB = require("./config/DbConnection");
const app = express();
const bodyParser = require('body-parser');
const router = express.Router();
const EBookController = require("./controllers/EbookController.js");
const AuthController = require("./controllers/AuthenticationController.js");
const passport = require('passport')
const initializePassport= require('./passport-config')
const methodOverride = require("method-override")
const fs = require('fs');
const flash = require("express-flash");
const session = require('express-session');


//Set up passport
initializePassport(
    passport,
    (email) => users.find((user) => user.email === email),
    (id) => users.find((user) => user.id === id)
);
// Set up HTML
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "views/HomePage.html"));
// });
// app.get('/', checkAuthenticated(req, res), (req, res) => {
//   res.render('index.ejs', { name: "BookWorm"})
// })
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', {
    name: "Joe",//req.user.name,
    lastname: "WorksHard",//req.user.lastName,
    email: "jk1839",//req.user.email,
    id: 1//req.user.id
  });
});
// app.get("/login", (req, res) => {
//   res.render('login.ejs')
// })
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})
// app.post('/login', (req, res) => {
//   res.render('login.ejs', {messages: ""})
// })
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
// app.get('/register', (req, res) => {
//   res.render('register.ejs')
// })
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
});
// app.post('/register', (req, res) => {
//   res.render('register.ejs', {messages: ""});
// })
app.delete('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

// Add data models used

const { authorModel } = require("./models/Author");
const { roleModel } = require("./models/Role");
const { userModel } = require("./models/User");
const { eBookModel } = require("./models/Ebook");
const { genreModel } = require("./models/Genre");
const { catalogModel } = require("./models/Catalog");



// Set up server and MongoDB connection
const {port, db} = InitConnection();


//Additional Setup

//app.use(logger);
app.set("view-engine", "ejs");
app.use(cors(corsOptions));
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.json());
app.use(flash());
app.use(methodOverride('_method'));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Set up routes

app.use("/", require("./routes/api/Root"));
//app.use("/catalog", require("./routes/api/Catalog.js"));
//app.use("/login", require("./routes/api/Login"));
//app.use("/logout", require("./routes/api/Logout")); //Add logout later



// Define search endpoint
app.get('/search', function(req, res) {
  const query = req.query.query;

  // Run search query on MongoDB collection
  db.collection('my_collection').find({ $text: { $search: query } }).toArray(function(err, results) {
    if (err) throw err;

    res.send(results);
  });
});
const { Hold } = require("./controllers/EbookController");
const path = require("path");
//const {checkAuthenticated} = require("./controllers/AuthenticationController");
app.post('/Hold', (req, res) => {
  EBookController.Hold(req, res);
});
// app.post('/Hold', bodyParser, (req, res) => {
//   EBookController.Hold(req, res);
// });
// const validateInput = require("some-file-with-")
app.post('/Add', (req, res) => {
  EBookController.addEbook(req, res);
})
app.put('/Return', (req, res) => {
  EBookController.Return(req, res);
});
app.put('/CheckOut', (req, res) => {
  EBookController.CheckOut(req, res);
});

// app.put('/register',  (req, res) => {
//   AuthController.register(req,res);
// });
// app.put('/login', (req, res) => {
//   AuthController.login(req,res);
// })
// Start server
// app.listen(port, function() {
//   console.log(`Server listening on port ${port}`);
//});
function InitConnection() {
  // Localhost setup
  const {env, port} = setLocalhost();
  //Connect to mongoDB
  return setDB(env, port);
}
function setLocalhost() {
  const path = require("path");
  const rootDir = path.resolve(__dirname, ".");
  const env = require("dotenv").config({path: `${rootDir}/.env`}).parsed;
  if (!env) {
    console.log(env);
    console.log("Environment variables file not found");
  }
  const port = process.env.PORT || env["PORT"] || 5000;
  return {env, port};
}

function setDB(env, port) {
  const dbConnectionUri = env["DB_CONNECTION_STRING"] || "mongodb://localhost:27017/bookworm";
  console.log(`Connecting to MongoDB at ${dbConnectionUri}`);
  connectDB(dbConnectionUri);
  let client = new MongoClient(dbConnectionUri);
  const db = client.db("bookworm");
  db.collection("ebook").findOneAndUpdate({_id: 6}, {$set: {"title": "Romeo and Juliet"}});
  return {port, db};
}

//Authentication functions
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