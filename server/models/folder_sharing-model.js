const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema({
    folderName: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sharedWith: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['0', '1', '2'], default: '1' } // 0 = accepted, 1 = pending
    }]
  }, { timestamps: true });
  

const folderSharing = new mongoose.model("folderSharing", folderSchema);
  
module.exports = folderSharing;
  