const mongoose = require("mongoose");
const genre = require("./Genre");
const authorModel = require("./Author");
const userModel = require("./User");
const eBookSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "author",
  },
  publisher: {
    type: String,
    required: true,
    default: "",
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "genre",
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
  formatType: {
    type: String,
    default: "pdf",
  },
  availableCopies: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalCopies: {
    type: Number,
    default: 0,
    min: 0,
  },
  holdQueue: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user"
  },
  pdf: {
    type: pdf,
    required: true
  }
});

module.exports = {
  eBookModel: mongoose.model("ebooks", eBookSchema),
  eBookSchema,
};
