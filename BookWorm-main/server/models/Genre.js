const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

module.exports = {
  genreModel: mongoose.model("genres", genreSchema),
  genreSchema,
};
