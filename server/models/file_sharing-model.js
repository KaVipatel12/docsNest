const mongoose = require("mongoose");

const fileSharingSchema = mongoose.Schema({
    fileName: String,              // original file name
    content: String,               // file content as string
    uploadedAt: { type: Date, default: Date.now },
  
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     
    status : { type: String }, // 0 -> Accepted , 1-> rejected 
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // optional
});

const fileSharing = new mongoose.model("fileSharing", fileSharingSchema);

module.exports = fileSharing;
