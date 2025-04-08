const User = require("../models/user-model");
const fileSharing = require("../models/file_sharing-model");
const folderSharing = require("../models/folder_sharing-model");
// const fs = require("fs");
const fs = require("fs").promises;
const path = require("path");
const Notes = require("../models/note-model");

const sendFileToUser = async (req, res, next) => {
    const { fileName, folderName, receiverId } = req.body;
    const userId = req.user._id;
  
    let content = "";
    let finalFileName = "";
  
    try {
      if (folderName) {
        const directoryPath = path.join(
          __dirname,
          "..",
          "userNotes",
          userId.toString(),
          folderName,
          fileName
        );
  
        content = await fs.readFile(directoryPath, "utf-8");
        finalFileName = fileName; // keep the original fileName
      } else {
        const noteFetch = await Notes.findById(fileName);
        if (!noteFetch) {
          return res.status(404).send({ msg: "Note not found" });
        }
        content = noteFetch.description;
        finalFileName = noteFetch.title;
      }
  
      // 📤 Share file (DB entry)
      const fileShare = await fileSharing.create({
        fileName: finalFileName,
        content: content,
        uploadedBy: userId,
        sharedWith: receiverId,
      });
  
      await User.findByIdAndUpdate(
        userId,
        { $push: { fileSharing: fileShare._id } },
        { new: true }
      );
  
      return res.status(200).send({ msg: fileShare });
    } catch (error) {
      console.error("File share error:", error);
      return res.status(500).send({ msg: "There is some error" });
    }
  };
  
const receiverFile = async (req , res , next) => {
    const userId = req.user._id 
    const fetchFiles = await fileSharing.find({sharedWith : userId});

    if(!fetchFiles){
       return res.status(406).send({msg : "No files are shared"}); 
    }

    return res.status(200).send({msg : fetchFiles}); 
}

const sendFolderToUser = async (req , res , next) => {
const {folderName, receiverId} = req.body;
const userId = req.user._id;

try {
    const folderShare = await folderSharing.create({
        folderName,
        uploadedBy: userId,
        sharedWith: receiverId,
      });
  
      await User.findByIdAndUpdate(
        userId,
        { $push: { folderSharing: folderShare._id}},
        { new: true }
      );

      return res.status(200).send({msg : folderShare})
} catch (error) {
  console.error("Folder share error:", error);
  return res.status(500).send({ msg: "There is some error" });
}
}

const receiveFolder = async (req , res , next) => {
    const userId = req.user._id
    const fetchFolderName = await folderSharing.find({sharedWith : userId})
    console.log(fetchFolderName)
   try{
     if(!fetchFolderName){
        return res.status(400).send({msg : "No folders shared"})
    }

    res.status(200).send({msg : fetchFolderName})
}catch(error){
    return res.status(500).send({msg : "There is some error in the server"})
}
}
module.exports = {sendFileToUser , receiverFile, sendFolderToUser, receiveFolder};