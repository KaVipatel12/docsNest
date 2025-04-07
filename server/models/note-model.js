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
});

const Notes = new mongoose.model("Notes", noteSchema);

module.exports = Notes;
