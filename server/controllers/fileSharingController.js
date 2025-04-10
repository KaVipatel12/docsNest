const User = require("../models/user-model");
const fileSharing = require("../models/file_sharing-model");
const folderSharing = require("../models/folder_sharing-model");
// const fs = require("fs");
const fs = require("fs").promises;
const path = require("path");
const Notes = require("../models/note-model");
const { error } = require("console");


const shareFilesAndFolders = async (req, res ) => {
  const { fileName = [], folderName = [], receiverId = [] } = req.body;
  const userId = req.user._id;

  console.log(fileName, folderName, receiverId);
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

        const sharedWithUsers = receiverId.map(id => ({
          userId: id,
          status: '1' // pending
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

    // Handle Folder Sharing
    if (folderName.length > 0) {
      for (const folder of folderName) {
        try {
          const sharedWithUsers = receiverId.map(id => ({
            userId: id,
            status: '1' // pending
          }));

          const folderShare = await folderSharing.create({
            folderName: folder,
            createdBy: userId,
            sharedWith: sharedWithUsers,
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


const acceptFolder = async (req, res ) => {
  const userId = req.user._id; 
  const { folderName, senderId } = req.body;

  console.log(folderName, senderId, userId);

  const basePath = path.join(__dirname, "..", "userNotes"); 
  const sourceDir = path.join(basePath, senderId.toString(), folderName); 
  const userDir = path.join(basePath, userId.toString());
  const destDir = path.join(userDir, folderName); 

  try {
    // Ensure user directory exists
    try {
      await fs.access(userDir); 
    } catch {
      console.log("Creating user directory");
      await fs.mkdir(userDir, { recursive: true }); 
    }

    // Check if folder already exists
    try {
      await fs.access(destDir);
      return res.status(400).send({ msg: "Directory with same name exists in your storage" });
    } catch {
      console.log("Destination folder does not exist, continuing...");
    }

    // Copy folder content
    await fs.cp(sourceDir, destDir, { recursive: true });

    // Update sharedWith status for this user
    await folderSharing.updateOne(
      { folderName, "sharedWith.userId": userId },
      { $set: { "sharedWith.$.status": "0" } } // Set to accepted
    );

    return res.status(200).send({ msg: "Folder saved successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).send({ msg: "There is some error in the server" });
  }
};

const rejectFolder = async (req, res ) => {
  const userId = req.user._id; 
  const { folderId } = req.body; 

  try {
    const update = await folderSharing.updateOne(
      { _id: folderId, "sharedWith.userId": userId },
      { $set: { "sharedWith.$.status": "2" } } // 2 = rejected
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
      { $set: { "sharedWith.$.status": "2" } } // 2 = rejected
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


module.exports = { shareFilesAndFolders, receiverFile, receiveFolder, acceptFolder, rejectFile , rejectFolder, fetchHistory};
