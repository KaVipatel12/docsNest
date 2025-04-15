const mongoose = require("mongoose");

const noteSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  access : {
    type: String,
    enum: ["private", "public"],
    default: "private"
  }
});

const Notes = new mongoose.model("Notes", noteSchema);

module.exports = Notes;
