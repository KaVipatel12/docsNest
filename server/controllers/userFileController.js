const { doesNotThrow } = require("assert");
const Folders = require("../models/folder-model");
const User = require("../models/user-model");
// const fs = require("fs");
const fs = require("fs").promises;
const path = require("path");

const createFolder = async (req, res, next) => {
  const { folderName } = req.body;
  const userId = req.user._id.toString();
  const basePath = path.join(__dirname, "..", "userNotes", userId);
  const createFolder = path.join(basePath, folderName);
  
  try {
    // Check if folder exists
    try {
      await fs.access(createFolder);
      return res.status(400).json({ message: "Folder already exists" });
    } catch {
      console.log("file doesn't exists");
    }

    await fs.mkdir(createFolder, { recursive: true });
    return res.status(201).json({
      message: "Folder created successfully",
      path: createFolder,
    });
  } catch (error) {
    next(new Error("Internal Server Error"));
  }
};

const createFile = async (req, res, next) => {
  const userId = req.user._id;
  const folderId = userId.toString();
  const { content, folderName, fileName } = req.body;

  // Validate inputs
  if (!fileName || !content) {
    return res
      .status(400)
      .json({ msg: "File name and content are required." });
  }

  try {
    const folderPath = path.join(
      __dirname,
      "..",
      "userNotes",
      folderId,
      folderName
    );
    const filePath = path.join(folderPath, fileName);

    // Check if folder exists
    try {
      await fs.access(folderPath);
    } catch (error) {
      return res.status(409).json({ msg: "Folder not found." });
    }

    // Try writing the file
    try {
      await fs.writeFile(filePath, content, "utf-8");

      // ✅ File was successfully written, now save to DB
      const createNewFile = new Folders({
        user: userId,
        folderName,
        fileName,
      });

      const createdFile = await createNewFile.save();
      await User.findByIdAndUpdate(
        userId,
        {
          $push: { folders: createdFile._id},
        },
        { new: true }
      );

      return res
        .status(201)
        .json({ msg: "File created successfully", path: filePath });

    } catch (error) {
      return res.status(500).json({ msg: "Error writing the file." });
    }

  } catch (err) {
    err.status = 500;
    next(err);
  }
};

const updateFolder = async (req, res, next) => {
  const { oldName, newName } = req.body;
  const userId = req.user._id.toString();
  const folderPath = path.join(__dirname, "..", "userNotes", userId);
  const oldFolderPath = path.join(folderPath, oldName);
  const newFolderPath = path.join(folderPath, newName);

  try {
    try {
      await fs.access(newFolderPath);
      return res.status(400).send({ msg: "Folder name already exists" });
    } catch {}

    await fs.rename(oldFolderPath, newFolderPath);

    // Update folderName in MongoDB
    await Folders.updateMany(
      { user: userId, folderName: oldName },
      { $set: { folderName: newName } }
    );

    return res.status(200).send({ msg: "Folder name updated" });
  } catch (error) {
    error.status = 500;
    next(error);
  }
};

const updateFileName = async (req, res, next) => {
  const { oldName, newName, folderName } = req.body;
  const userId = req.user._id.toString();
  const filePath = path.join(__dirname, "..", "userNotes", userId, folderName);
  const oldFilePath = path.join(filePath, oldName);
  const newFilePath = path.join(filePath, newName);

  try {
    await fs.access(newFilePath);
    return res.status(400).send({ msg: "File name already exists" });
  } catch {}

  await fs.rename(oldFilePath, newFilePath);

  // Update fileName in MongoDB
  await Folders.findOneAndUpdate(
    { user: userId, fileName: oldName, folderName },
    { $set: { fileName: newName } }
  );

  return res.status(200).send({ msg: "File name changed successfully" });
};

const updateFileContent = async (req, res, next) => {
  const { newContent, oldFileName, newFileName, folderName } = req.body;
  const userId = req.user._id.toString();

  const oldFilePath = path.resolve(__dirname, "..", "userNotes", userId, folderName, oldFileName);
  const newFilePath = path.resolve(__dirname, "..", "userNotes", userId, folderName, newFileName);

  try {
    await fs.access(oldFilePath);
  } catch {
    return res.status(404).json({ msg: "Original file not found" });
  }

  try {
    if (oldFilePath === newFilePath) {
      await fs.writeFile(oldFilePath, newContent, "utf-8");
      return res.status(200).json({ msg: "File updated successfully" });
    } else {
      try {
        await fs.access(newFilePath);
        return res.status(400).json({ msg: "File name already exists" });
      } catch {
        await fs.rename(oldFilePath, newFilePath);
        await fs.writeFile(newFilePath, newContent, "utf-8");

        // Rename in DB
        await Folders.findOneAndUpdate(
          { user: userId, fileName: oldFileName, folderName },
          { $set: { fileName: newFileName } }
        );

        return res.status(200).json({ msg: "File renamed and updated successfully" });
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: "Something went wrong" });
  }
};

const deleteFile = async (req, res, next) => {
  const { fileName, folderName } = req.body;
  const userId = req.user._id.toString();

  const filePath = path.join(__dirname, "..", "userNotes", userId, folderName, fileName);

  try {
    await fs.access(filePath);
    await fs.unlink(filePath);

    // Remove from DB
    const deletedDoc = await Folders.findOneAndDelete({
      user: userId,
      fileName,
      folderName,
    });

    if (deletedDoc) {
      await User.findByIdAndUpdate(userId, {
        $pull: { folders: deletedDoc._id },
      });
    }

    return res.status(200).send({ msg: "File deleted" });
  } catch (err) {
    return res.status(400).send({ msg: "Error deleting file or not found" });
  }
};

const deleteFolder = async (req, res, next) => {
  const { folderName } = req.body;
  const userId = req.user._id.toString();

  const folderPath = path.join(__dirname, "..", "userNotes", userId, folderName);

  try {
    await fs.access(folderPath);
    await fs.rm(folderPath, { recursive: true, force: true });

    // Find all files under this folder
    const deletedFiles = await Folders.find({ user: userId, folderName });

    // Remove from User model
    if(deletedFiles){
      const deletedIds = deletedFiles.map((file) => file._id);
      await User.findByIdAndUpdate(userId, {
        $pull: { folders: { $in: deletedIds } },
      });
      
      // Delete all Folders entries
      await Folders.deleteMany({ user: userId, folderName });
    }

    return res.status(200).send({ msg: "Folder and its files deleted" });
  } catch (error) {
    return res.status(409).send({ msg: "Folder not found or error deleting folder" });
  }
};


const fetchFolder = async (req, res, next) => {
  const userId = req.user._id.toString();

  try {
    const directoryPath = path.join(__dirname, "..", "userNotes", userId);

    let folders = [];
    try {
      folders = await fs.readdir(directoryPath); // Read folder names
    } catch (error) {
      return res.status(500).json({ msg: "Error reading folders from filesystem." });
    }

    return res.status(200).json({ msg: folders });
  } catch (error) {
    error.status = 500;
    next(error);
  }
};

const fetchFile = async (req, res, next) => {
  const userId = req.user._id.toString();
  const { folderName } = req.body;

  try {
    const fileDocs = await Folders.find({
      user: userId,
      folderName: folderName,
    });

    const filesWithFav = fileDocs.map((doc) => ({
      fileName: doc.fileName,
      isFavorite: doc.favourite,
    }));

    filesWithFav.sort((a, b) => b.isFavorite - a.isFavorite);

    return res.status(200).send({ msg: filesWithFav });
  } catch (error) {
    error.status = 500;
    next(error);
  }
};


const fetchFileContent = async (req, res , next) => {
  const userId = req.user._id.toString(); 
  const {folderName, fileName} = req.body; 
  try{
    const directoryPath = path.join(
      __dirname,
      "..",
      "userNotes",
      userId, 
      folderName, 
      fileName
    );

    try{
      const files = await fs.readFile(directoryPath, 'utf-8'); 
      const fetchFile = await Folders.findOne({ user: userId, folderName, fileName }, "access").lean();
      const access = fetchFile.access; 
      return res.status(200).send({msg : files , access})
    }catch(error){
      return res.status(200).send({msg : "There is some error"});   
    }

  }catch(error){
    error.status = 500;
    next(error)
  }
}

const uploadFile = async (req, res , next) =>{
  try {
    const file = req.file;
    const userId = req.user._id.toString(); 
    const {folderName} = req.body
    if (!file) {
      return res.status(400).send({msg : "No file uploaded"});
    }
    
    const uploadsDir = path.join(__dirname, ".." , "userNotes" , userId, folderName);
    const filePath = path.join(uploadsDir, file.originalname);
    
    try {
      await fs.access(filePath);
      return res.status(400).send({msg : `File "${file.originalname}" already exists.`});
    } catch (err) {
    }

    await fs.writeFile(filePath, file.buffer);
    res.status(200).send({msg : `File "${file.originalname}" uploaded successfully!`});
    
  } catch (err) {
   err.status = 500;
   next(err)
  }
}

const addFavourite = async (req , res , next) => {
  const user = req.user._id; 
  const {fileName , folderName} = req.params; 

  try{
   const addFav = await Folders.findOneAndUpdate({user, folderName , fileName}, 
      [{
        $set: {
          favourite: { $not: "$favourite" }
        }
      }], {new : true}
  )
  res.status(200).send({msg : "Set as favourite"})
}catch(err){
  err.status = 500; 
  next(err); 
}
}
module.exports = {
  createFolder,
  createFile,
  updateFolder,
  updateFileName,
  updateFileContent,
  deleteFile,
  deleteFolder,
  fetchFile,
  fetchFolder, 
  fetchFileContent,
  uploadFile, 
  addFavourite
};
