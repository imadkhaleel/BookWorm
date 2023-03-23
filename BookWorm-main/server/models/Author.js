const mongoose = require("mongoose");
const { genreModel } = require("./Genre");
const { userModel } = require("./User");
const { eBookModel } = require("./Ebook")

const authorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "genre",
  },
  ebooks: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "eBook",
  },
});

module.exports = {
  authorModel: mongoose.model("author", authorSchema),
  authorSchema,
};