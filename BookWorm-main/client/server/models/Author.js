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
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: userModel,
  },
  genre: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: genreModel,
  },
  ebooks: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: eBookModel }],
  },
});

module.exports = {
  authorModel: mongoose.model("author", authorSchema),
  authorSchema,
};