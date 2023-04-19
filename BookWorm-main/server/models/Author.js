const mongoose = require("mongoose");
const { genreModel } = require("./Genre");
const { eBookModel } = require("./Ebook");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  ebooks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "eBook",
  },
});

module.exports = {
  authorModel: mongoose.model("authors", authorSchema),
  authorSchema,
};