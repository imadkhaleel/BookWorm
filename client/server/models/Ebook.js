const mongoose = require("mongoose");
const genre = require("./Genre");
const authorModel = require("./Author");
const userModel = require("./User");
const eBookSchema = new mongoose.Schema({
  author: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: authorModel,
  },
  publisher: {
    type: String,
    required: true,
    default: "",
  },
  genre: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: genre,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  numberOfPages: {
    type: Number,
    required: true,
  },
  ISBN: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
    required: true,
  },
  publishDate: {
    type: Date,
    required: true,
  },
  coverImageURL: {
    type: String,
  },
  availableCopies: {
    type: Number,
    default: 0,
    min: 0,
  },
  formatType: {
    type: String,
    default: "pdf",
  },
  holdQueue: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: userModel
  }
});

module.exports = {
  eBookModel: mongoose.model("eBook", eBookSchema),
  eBookSchema,
};
