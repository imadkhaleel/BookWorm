const mongoose = require("mongoose");
const { ebookModel } = require("./Ebook");
const { authorModel } = require("./Author");
//const { formatModel } = require("./Format");

const listedEbookSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "author",
  },
  ebook: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "ebook",
  },
  //formats: {
  //  type: [{ type: mongoose.Schema.Types.ObjectId, ref: "format" }],
  //  default: [],
  //},
});

module.exports = {
  listedEbookModel: mongoose.model("Listedebook", listedEbookSchema),
  listedEbookSchema,
};