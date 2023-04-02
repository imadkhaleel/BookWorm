const mongoose = require("mongoose");
const { genreModel } = require("./Genre");
const { eBookModel } = require("./Ebook")

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "genre",
  },
  ebooks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "eBook",
  },
});

module.exports = {
  authorModel: mongoose.model("author", authorSchema),
  authorSchema,
};