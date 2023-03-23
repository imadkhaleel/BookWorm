const mongoose = require("mongoose");

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB Connected");
  } 
  catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;