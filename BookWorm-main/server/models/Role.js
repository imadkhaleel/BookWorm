const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  memberType: { //Previously clearanceLevel
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = {
  roleModel: mongoose.model("Role", roleSchema), 
  roleSchema
};