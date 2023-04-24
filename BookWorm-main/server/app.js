
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
//const { catalogModel } = require("./models/Catalog");

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

const dbConnectionUri = "mongodb+srv://bookworm:5HWcWyzt5rP9nlbO@cluster0.bx9zacx.mongodb.net/bookworm?retryWrites=true&w=majority" //env["DB_CONNECTION_STRING"]// || "mongodb://localhost:27017/bookworm";
console.log(`Connecting to MongoDB at ${dbConnectionUri}`);
connectDB(dbConnectionUri);
let client = new MongoClient(dbConnectionUri);
const db = client.db("bookworm");

// const getroles = async () => {
//   roles = await roleModel.find({}).exec();
//
// }

//console.log(roles);
async function seedDatabase() {

  let rolesInDB = roleModel.countDocuments({}, {hint: "_id_"});
  if(rolesInDB === 0) { //If no roles in DB, create them.
    roleModel.create({
      memberType: 2,
      name: "Curator"
    });
    roleModel.create({
      memberType: 1,
      name: "Member"
    });
    roleModel.create({
      memberType: 0,
      name: "Visitor"
    });
  }
    //   const users = await userModel.find({}).exec();
    //if(users.length === 0) {
      //console.log("No users found in database. Creating them");
    //   const dob_string = "11/17/2001";
    //   const saltRounds = 10;
    //   const adminRoleId = await roleModel.findOne({ name: "Admin" }).exec();
    //   const encryptedAdminPassword = await bcrypt.hash("BookwormAdmin!", saltRounds);
    //   const adminUser = await roleModel.create({
    //     roles: [(await adminRoleId)._id],
    //     dateOfBirth: new Date(dob_string),
    //     firstName: "Alden",
    //     lastName: "Lipiarski",
    //     username: "AdminUser1",
    //     email: "ajl302@scarletmail.rutgers.edu",
    //     password: encryptedAdminPassword,
    //     loginAttempts: 0,
    //     checkedOutBookIds: [],
    //     status: "Normal"
    //   });
    // //}
    //   const curatorId = await roleModel.findOne({ name: "Curator" }).exec();
    //   const dob_curator = "01/01/2001";
    //   const encryptedCuratorPassword = await bcrypt.hash("BookwormCurator!", saltRounds);
    //   const curatorUser = await roleModel.create({
    //     roles: [(await curatorId)._id],
    //     dateOfBirth: new Date(dob_curator),
    //     firstName: "Joe",
    //     lastName: "Kabashima",
    //     username: "CuratorUser1",
    //     email: "jk1839@scarletmail.rutgers.edu",
    //     password: encryptedCuratorPassword,
    //     loginAttempts: 0,
    //     checkedOutBookIds: [],
    //     status: "Normal"
    //   });
    //
    //   const memberRoleId = await roleModel.findOne({ name: "Member" }).exec();
    //   const dob_member = "02/02/2002";
    //   const encryptedMemberPassword = await bcrypt.hash("BookwormCurator!", saltRounds);
    //   const memberUser = await roleModel.create({
    //     roles: [(await memberRoleId)._id],
    //     dateOfBirth: new Date(dob_member),
    //     firstName: "Nithish",
    //     lastName: "Warren",
    //     username: "MemberUser1",
    //     email: "nw276@scarletmail.rutgers.edu",
    //     password: encryptedMemberPassword,
    //     loginAttempts: 0,
    //     checkedOutBookIds: [],
    //     status: "Normal"
    //   });

      // const sampleAuthor = authorModel.create({
      //   name: "Marsic",
      //   ebooks: []
      // })
      // const sampleGenre = genreModel.create({
      //   name: "Education"
      // })
      // const sampleEbook = eBookModel.create({
      //   author: (await sampleAuthor)._id,
      //   publisher: "Self Published",
      //   genre: (await sampleGenre)._id,
      //   title: "My First Textbook",
      //   numberOfPages: 666,
      //   ISBN: "111-2222233338",
      //   description: "This is my very first textbook, and I am proud of it",
      //   publishDate: new Date("09/08/2012"),
      //   coverImageURL: "https://www.ece.rutgers.edu/sites/default/files/Marsic.jpg",
      //   formatType: "pdf",
      //   availableCopies: 4,
      //   totalCopies: 4,
      //   holdQueue: []
      // });
      // (await sampleAuthor).ebooks.push((await sampleEbook)._id); //Add to Author's publications
}

seedDatabase();
//Additional Setup

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
const EbookController = require("./controllers/EbookController.js");
app.patch('/Hold', (req, res) => {
  EBookController.Hold(req, res);
});
// app.post('/Hold', bodyParser, (req, res) => {
//   EBookController.Hold(req, res);
// });
app.post('/Add', (req, res) => {
  EBookController.addEbook(req, res);
})
app.patch('/Return', (req, res) => {
  EBookController.Return(req, res);
});
app.patch('/CheckOut', (req, res) => {
  EBookController.CheckOut(req, res);
});

app.put('/register',  (req, res) => {
  AuthController.register(req,res);
});

//auto return function
setInterval(EbookController.returnOverdueBooks, 1000);//24 * 60 * 60 * 1000); //check every 24 hours

