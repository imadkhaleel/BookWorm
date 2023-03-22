const mongoose = require("mongoose");
const { ebookModel } = require("./Ebook");
const { authorModel } = require("./Author");
const { formatModel } = require("./Format");

const listedEbookSchema = new mongoose.Schema({
  creator: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: authorModel,
  },
  ebook: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: ebookModel,
  },
  formats: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: formatModel }],
    default: [],
  },
});

module.exports = {
  listedEbookModel: mongoose.model("Listedebook", listedEbookSchema),
  listedEbookSchema,
};