
//NPM packages

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt")
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { corsOptions } = require("./config/CorsOptions");
const connectDB = require("./config/DbConnection");
const app = express();


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

// Set up routes

app.use("/", require("./routes/api/Root"));
//app.use("/catalog", require("./routes/api/Catalog.js"));
app.use("/login", require("./routes/api/Login"));
//app.use("/logout", require("./routes/api/Logout")); //Add logout later