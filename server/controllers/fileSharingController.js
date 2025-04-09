const User = require("../models/user-model");
const fileSharing = require("../models/file_sharing-model");
const folderSharing = require("../models/folder_sharing-model");
// const fs = require("fs");
const fs = require("fs").promises;
const path = require("path");
const Notes = require("../models/note-model");
const { error } = require("console");


const shareFilesAndFolders = async (req, res, next) => {
  const { fileName = [], folderName = [], receiverId = [] } = req.body;
  const userId = req.user._id;

  console.log(fileName , folderName , receiverId)
  let fileResults = [];
  let fileErrors = [];

  let folderShareIds = [];
  let folderErrors = [];

  try {
    //  Handle File Sharing
    if (fileName.length > 0) {
      for (const file of fileName) {
        const note = await Notes.findById(file);

        if (!note) {
          fileErrors.push({ msg: `Note ${file} not found` });
          continue;
        }

        const content = note.description;
        const finalFileName = note.title;

        const fileShare = await fileSharing.create({
          fileName: finalFileName,
          content,
          uploadedBy: userId,
          sharedWith: receiverId,
        });

        await User.findByIdAndUpdate(
          userId,
          { $push: { fileSharing: fileShare._id } },
          { new: true }
        );

        fileResults.push({
          file: finalFileName,
          sharedWith: receiverId,
          fileId: fileShare._id,
        });
      }
    }

    // Handle Folder Sharing
    if (folderName.length > 0) {
      for (const folder of folderName) {
        try {
          const folderShare = await folderSharing.create({
            folderName: folder,
            createdBy: userId,
            sharedWith: receiverId,
          });

          folderShareIds.push(folderShare._id);
        } catch (err) {
          folderErrors.push({ msg: `Failed to share folder ${folder}` });
        }
      }

      // Push all shared folder IDs to user
      if (folderShareIds.length > 0) {
        await User.findByIdAndUpdate(
          userId,
          { $push: { folderSharing: { $each: folderShareIds } } },
          { new: true }
        );
      }
    }

    return res.status(200).send({
      msg: "Files and folders shared successfully",
      shared: {
        files: fileResults,
        folders: folderShareIds,
      },
      errors: {
        files: fileErrors.length > 0 ? fileErrors : undefined,
        folders: folderErrors.length > 0 ? folderErrors : undefined,
      },
    });
  } catch (error) {
    console.error("Share error:", error);
    return res.status(500).send({ msg: "Server error while sharing" });
  }
};
  
const receiverFile = async (req , res , next) => {
    const userId = req.user._id 
    const fetchFiles = await fileSharing.find({sharedWith : userId}).populate("uploadedBy", "username email"); 

    if(!fetchFiles){
       return res.status(406).send({msg : "No files are shared"}) 
    }

    return res.status(200).send({msg : fetchFiles}); 
}


const receiveFolder = async (req , res , next) => {
    const userId = req.user._id
    const fetchFolderName = await folderSharing.find({sharedWith : userId}).populate("createdBy", "username email")
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
module.exports = { shareFilesAndFolders, receiverFile, receiveFolder};
