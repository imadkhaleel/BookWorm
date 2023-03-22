const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
    eBooks: {
        type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "eBook" }],
        default: [],
    },
    name: {
        type: String,
        required: true,
    },
});

module.exports = {
  genreModel: mongoose.model("Genre", genreSchema),
  genreSchema,
};
