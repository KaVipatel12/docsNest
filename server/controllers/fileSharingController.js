const User = require("../models/user-model");
const fileSharing = require("../models/file_sharing-model");
const folderSharing = require("../models/folder_sharing-model");
const Folder = require("../models/folder-model")
// const fs = require("fs");
const fs = require("fs").promises;
const path = require("path");
const Notes = require("../models/note-model");

const shareFilesAndFolders = async (req, res) => {
  const { fileName = [], folderName = [], receiverId = [] } = req.body;
  const userId = req.user._id;

  let fileResults = [];
  let fileErrors = [];
  let folderResults = [];
  let folderErrors = [];

  try {
    // Share Files
    if (fileName.length > 0) {
      for (const fileId of fileName) {
        const note = await Notes.findById(fileId);
        if (!note) {
          fileErrors.push({ msg: `Note ${fileId} not found` });
          continue;
        }

        const content = note.description;
        const finalFileName = note.title;

        const sharedWithUsers = receiverId.map(id => ({
          userId: id,
          status: '1', // pending
        }));

        const fileShare = await fileSharing.create({
          fileName: finalFileName,
          content,
          uploadedBy: userId,
          sharedWith: sharedWithUsers,
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

    // Share Folders
    if (folderName.length > 0) {
      for (const folder of folderName) {
        const sharedWithUsers = receiverId.map(id => ({
          userId: id,
          status: '1', // pending
        }));

        const folderShare = await folderSharing.create({
          folderName: folder,
          createdBy: userId,
          sharedWith: sharedWithUsers,
        });

        folderResults.push({
          folderName: folder,
          sharedWith: receiverId,
          folderId: folderShare._id,
        });
      }
    }
    console.log(folderResults)
    return res.status(200).send({
      msg: "Files and folders shared successfully",
      shared: {
        files: fileResults,
        folders: folderResults,
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

const receiverFile = async (req, res ) => {
  const userId = req.user._id;

  const fetchFiles = await fileSharing.find({
    sharedWith: {
      $elemMatch: {
        userId: userId,
        status: '1'  // only pending
      }
    }
  }).populate("uploadedBy", "username email");

  if (!fetchFiles || fetchFiles.length === 0) {
    return res.status(406).send({ msg: "No pending shared files found" });
  }
  return res.status(200).send({ msg: fetchFiles });
};

const receiveFolder = async (req, res ) => {
  const userId = req.user._id;
  try {
    const fetchFolderName = await folderSharing.find({
      sharedWith: {
        $elemMatch: {
          userId: userId,
          status: '1'  // only pending
        }
      }
    }).populate("createdBy", "username email");

    if (!fetchFolderName || fetchFolderName.length === 0) {
      return res.status(400).send({ msg: "No pending shared folders found" });
    }

    res.status(200).send({ msg: fetchFolderName });
  } catch (error) {
    return res.status(500).send({ msg: "There is some error in the server" });
  }
};

const acceptFile = async (req, res) => {
  const receiverId = req.user._id;
  const { fileId } = req.body;

  try {
    const file = await fileSharing.findOne({
      _id: fileId,
      "sharedWith.userId": receiverId, "sharedWith.$.seen" : true
    }).populate("uploadedBy");

    if (!file) {
      return res.status(404).json({ msg: "File not found or not shared with you." });
    }

    const originalNote = await Notes.findById(file.fileId);
    if (!originalNote) {
      return res.status(404).json({ msg: "Original note not found." });
    }

    // Create new note for receiver
    const newNote = new Notes({
      user: receiverId,
      title: originalNote.title + " (shared by " + file.uploadedBy.username + ")",
      description: originalNote.description,
      access: "private", // Or you can preserve original access
    });

    const savedNote = await newNote.save();

    //  Update fileSharing status to accepted
    await fileSharing.updateOne(
      { _id: fileId, "sharedWith.userId": receiverId },
      { $set: { "sharedWith.$.status": "0" } }
    );

    //  Add to receiver's notes[]
    await User.findByIdAndUpdate(receiverId, {
      $push: { notes: savedNote._id },
    });

    return res.status(200).json({ msg: "Note accepted and added to your account." });

  } catch (err) {
    console.error("Error in acceptFile:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

const acceptFolder = async (req, res) => {
  const receiverId = req.user._id;
  const { folderName, senderId } = req.body;

  try {
    const sharedFolder = await folderSharing.findOne({
       folderName,
      createdBy: senderId,
      'sharedWith.userId': receiverId, "sharedWith.$.seen" : true
    });

    if (!sharedFolder) {
      return res.status(404).send({ msg: "Folder not found" });
    }

    // Find all files from sender's folder
    const senderFiles = await Folder.find({
      user: senderId,
      folderName: folderName
    });

    if (!senderFiles.length) {
      return res.status(404).send({ msg: "No files found in the shared folder" });
    }

    const createdFiles = [];

    for (const file of senderFiles) {
      const newFile = new Folder({
        user: receiverId,
        folderName: file.folderName + " (shared)",
        fileName: file.fileName,
        content: file.content,
        favourite: false,
        access: "private",
      });

      const saved = await newFile.save();
      createdFiles.push(saved._id);
    }

    // Update folder sharing status
    await folderSharing.updateOne(
      { _id: sharedFolder._id, 'sharedWith.userId': receiverId },
      { $set: { 'sharedWith.$.status': '0' } }
    );

    return res.status(200).send({
      msg: "Folder accepted. Files added to your account.",
      filesCreated: createdFiles.length
    });

  } catch (error) {
    console.error("Accept folder error:", error);
    return res.status(500).send({ msg: "Server error while accepting folder" });
  }
};

const rejectFolder = async (req, res ) => {
  const userId = req.user._id; 
  const { folderId } = req.body; 

  try {
    const update = await folderSharing.updateOne(
      { _id: folderId, "sharedWith.userId": userId },
      { $set: { "sharedWith.$.status": "2", "sharedWith.$.seen" : true } } // 2 = rejected
    );

    if (update.modifiedCount === 0) {
      return res.status(404).send({ msg: "No matching folder or user found" });
    }

    return res.status(200).send({ msg: "Folder rejected successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "There is some error in the server" });
  }
};

const rejectFile = async (req, res ) => {
  const userId = req.user._id; 
  const { fileId } = req.body; 

  try {
    const update = await fileSharing.updateOne(
      { _id: fileId, "sharedWith.userId": userId },
      { $set: { "sharedWith.$.status": "2", "sharedWith.$.seen" : true } } // 2 = rejected
    );

    if (update.modifiedCount === 0) {
      return res.status(404).send({ msg: "No matching file or user found" });
    }

    return res.status(200).send({ msg: "File rejected successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "There is some error in the server" });
  }
};

const fetchHistory = async (req, res) => {
  const userId = req.user._id;

  try {
    const sharedFiles = await fileSharing.find({
      sharedWith: {
        $elemMatch: { userId: userId }
      }
    }).populate("uploadedBy", "username email");

    const sharedFolders = await folderSharing.find({
      sharedWith: {
        $elemMatch: { userId: userId }
      }
    }).populate("createdBy", "username email");

    if (!sharedFiles.length && !sharedFolders.length) {
      return res.status(400).send({ msg: "No shared files or folders found." });
    }

    const formattedFiles = sharedFiles.map(file => {
      const userData = file.sharedWith.find(u => u.userId && u.userId.toString() === userId.toString());
      return {
        ...file.toObject(),
        direction: 'received',
        type: 'file',
        status: userData?.status || '1',
        sharedWith: userData ? userData.userId : null
      };
    });

    const formattedFolders = sharedFolders.map(folder => {
      const userData = folder.sharedWith.find(u => u.userId && u.userId.toString() === userId.toString());
      return {
        ...folder.toObject(),
        direction: 'received',
        type: 'folder',
        status: userData?.status || '1',
        sharedWith: userData ? userData.userId : null
      };
    });

    const sentFiles = await fileSharing.find({ uploadedBy: userId })
      .populate("sharedWith.userId", "username email");

    const sentFolders = await folderSharing.find({ createdBy: userId })
      .populate("sharedWith.userId", "username email");

    const allItems = [
      ...formattedFiles,
      ...formattedFolders,
      ...sentFiles.map(file => ({
        ...file.toObject(),
        direction: 'sent',
        type: 'file',
        status: 'sent',
        sharedWith: file.uploadedBy
      })),
      ...sentFolders.map(folder => ({
        ...folder.toObject(),
        direction: 'sent',
        type: 'folder',
        status: 'sent',
        sharedWith: folder.createdBy
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log(allItems)
    res.status(200).send({ msg: allItems });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).send({ msg: "There is some error in the server." });
  }
};

const showFileWithLink = async (req , res) => {
  const {userId , fileName} = req.params; 

try{
  const findUser = await User.findById(userId).populate("notes"); 

  if(!findUser){
    return res.status(406).send({msg : "User not found"})
  }
  const fetchNote = findUser.notes.find(notes => notes._id.toString() === fileName);
  if(fetchNote.access === "private"){
    return res.status(406).send({msg : "Can't access private folder"})
  } 

  if(!fetchNote){
    return res.status(406).send({msg : "Notes not found"})
  }

  res.status(200).send({msg : fetchNote}); 
}catch(error){
  res.status(500).send({msg : "There is some error in the server"})
}
}

const showFolderFileWithLink = async (req, res) => {
  const { userId, folderName, fileName } = req.params;

  try {
    const findUser = await User.findById(userId).populate("folders");
    if (!findUser) {
      return res.status(406).send({ msg: "User not found" });
    }

    const findFile = findUser.folders
      .filter(folder => folder.folderName === folderName)
      .find(file => file.fileName === fileName);

    if (!findFile) {
      return res.status(406).send({ msg: "File not found" });
    }

    if (findFile.access !== "public") {
      return res.status(403).send({ msg: "File is private" });
    }

    return res.status(200).send({ msg: findFile.content });

  } catch (error) {
    console.error("Error in showFolderFileWithLink:", error);
    return res.status(500).send({ msg: "There is some error in the server" });
  }
};

const markSeen = async (req, res) => {
  const userId = req.user._id;
  const { files = [], folders = [] } = req.body;

  try {
    // Mark shared files as seen
    const fileSeenResults = await Promise.all(
      files.map(async ({ fileName, sendId }) => {
        const result = await fileSharing.updateOne(
          {
            fileName,
            uploadedBy: sendId._id,
            "sharedWith.userId": userId,
          },
          { $set: { "sharedWith.$.seen": true } }
        );
        return result;
      })
    );
    // Mark shared folders as seen
    const folderSeenResults = await Promise.all(
      folders.map(async ({ folderName, sendId }) => {
        const result = await folderSharing.updateOne(
          {
            folderName,
            createdBy: sendId,
            "sharedWith.userId": userId,
          },
          { $set: { "sharedWith.$.seen": true } }
        );
        return result;
      })
    );

    console.log("File update results:", fileSeenResults);
    console.log("Folder update results:", folderSeenResults);

    res.status(200).json({ msg: "Seen status updated successfully." });
  } catch (err) {
    console.error("Error updating seen status:", err);
    res.status(500).json({ msg: "Something went wrong while updating seen." });
  }
};

const setShareFilePassword = async (req , res) => {

  const userId = req.user._id; 
  const {password, fileName , folderId} = req.body;
  console.log(password , fileName, folderId)
  console.log("reached")
try{  
  if(folderId){
    const setPassword = await Folder.findByIdAndUpdate( folderId , {
      $set : {
        password : password
      }
    }, {new : true} )

    return res.status(200).send({msg : setPassword }); 
  }
  const setPassword = await Notes.findByIdAndUpdate( fileName , {
    $set : {
      password : password
    }
  }, {new : true} )

  return res.status(200).send({msg : setPassword}); 
}catch(err){
  console.log(err)
  err.status = 500; 
  next(err)
}}

const verifyFilePassword = async (req, res, next) => {
  const { password, folder, file } = req.body;

  try {
    let resource = null;
    let isMatch = false;

    if (folder) {
      resource = await Folder.findById(folder);
      isMatch = resource?.password === password;
    } else if (file) {
      resource = await Notes.findById(file);
      isMatch = resource?.password === password;
    }

    if (!resource) {
      return res.status(404).send({ msg: "Resource not found" });
    }

    if (isMatch) {
      return res.status(200).send({ msg: resource });
    }

    return res.status(400).send({ msg: "Invalid password" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

module.exports = { shareFilesAndFolders, receiverFile, receiveFolder, acceptFolder, rejectFile , rejectFolder, fetchHistory, showFileWithLink, showFolderFileWithLink, acceptFile, markSeen, setShareFilePassword, verifyFilePassword};
