const mongoose = require("mongoose");

const folderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  folderName: {
    type: String,
    require: true,
  },
  fileName: {
    type: String,
    require: true,
  },
  favourite : {
    type : Boolean, 
    default : false
  },
  access: {
    type: String,
    enum: ["private", "public"],
    default: "private"
  }
});

const Folders = new mongoose.model("Folders", folderSchema);

module.exports = Folders;
