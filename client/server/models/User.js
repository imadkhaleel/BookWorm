const { eBookModel } = require("./Ebook");
const { roleModel } = require("./Role")

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  roles: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: roleModel,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    required: true
  },
  email: { //User identifier
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0,
  },
  checked_out_books: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: eBookModel
  },
  status: {
    type: String,
    default: "Normal" //String changes to locked after loginAttempts exceeds 5
  },
  refreshToken: String
});


module.exports = {
  userModel: mongoose.model("User", userSchema),
  userSchema,
};
