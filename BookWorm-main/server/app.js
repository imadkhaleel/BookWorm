
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
app.get('/', (req, res) => {
  res.render('index.ejs', { name: "BookWorm"})
})
app.get("/login", (req, res) => {
  res.render('login.ejs')
})
app.post('/login', (req, res) => {
  res.render('login.ejs', {messages: ""})
})
app.get('/register', (req, res) => {
  res.render('register.ejs')
})
app.post('/register', (req, res) => {
  res.render('register.ejs', {messages: ""});
})
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
let client = new MongoClient(dbConnectionUri);
const db = client.db("bookworm");
db.collection("ebook").findOneAndUpdate({_id: 6}, {$set: {"title": "Romeo and Juliet"}});


//Additional Setup

//app.use(logger);
app.set("view-engine", "ejs");
app.use(cors(corsOptions));
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.json());
app.use(methodOverride('_method'));
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Set up routes

app.use("/", require("./routes/api/Root"));
//app.use("/catalog", require("./routes/api/Catalog.js"));
//app.use("/login", require("./routes/api/Login"));
//app.use("/logout", require("./routes/api/Logout")); //Add logout later


// Set up server and MongoDB connection 
// const app = express();
// const port = 3000;
// const url = 'mongodb://localhost:27017';
// const dbName = 'my_database';
// let db;

//MongoClient.connect(url, function(err, client) {
//  console.log("Connected successfully to server");
//
//  db = client.db(dbName);
//});

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
app.post('/Hold', (req, res) => {
  EBookController.Hold(req, res);
});
// app.post('/Hold', bodyParser, (req, res) => {
//   EBookController.Hold(req, res);
// });
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
