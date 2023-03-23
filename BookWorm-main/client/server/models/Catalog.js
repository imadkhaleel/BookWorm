const mongoose = require("mongoose");
const { eBookModel } = require("./Ebook");

const catalogSchema = new mongoose.Schema({
  ebooks: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "eBook" }],
    required: true,
    default: []
  },
});
module.exports = {
    catalogModel: mongoose.model("Catalog", catalogSchema),
    catalogSchema,
  };
  