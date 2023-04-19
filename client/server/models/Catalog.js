const mongoose = require("mongoose");
const { eBookModel } = require("./Ebook");

const catalogSchema = new mongoose.Schema({
  ebooks: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: eBookModel }],
    required: true,
    default: []
  },
});
module.exports = {
    catalogModel: mongoose.model("Catalog", catalogSchema),
    catalogSchema,
  };
  