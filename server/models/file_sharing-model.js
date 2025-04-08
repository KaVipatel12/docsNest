const mongoose = require("mongoose");

const fileSharingSchema = mongoose.Schema({
    fileName: String,              // original file name
    content: String,               // file content as string
    size: Number,                  // length in characters or bytes
    uploadedAt: { type: Date, default: Date.now },
  
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // optional
});

const fileSharing = new mongoose.model("fileSharing", fileSharingSchema);

module.exports = fileSharing;
