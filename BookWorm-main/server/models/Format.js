const mongoose = require("mongoose");
const { ebookModel } = require("./ebook");

const formatSchema = new mongoose.Schema({
  ebook: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: ebookModel,
  },
  type: {
    type: String,
    required: true,
  },
  preview: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
});

module.exports = {
  formatModel: mongoose.model("formats", formatSchema),
  formatSchema,
};