const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
    folderName: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  }, { timestamps: true });
  

const folderSharing = new mongoose.model("folderSharing", folderSchema);
  
module.exports = folderSharing;
  