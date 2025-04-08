const User = require("../models/user-model");
// const fs = require("fs");
const fs = require("fs").promises;
const path = require("path");

const createFolder = async (req, res, next) => {
  const { folderName } = req.body;
  console.log(folderName)
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
    console.error("Error creating folder:", error);
    next(new Error("Internal Server Error"));
  }
};

// creating file in the specific folder.
const createFile = async (req, res, next) => {
  const userId = req.user._id;
  const folderId = userId.toString();
  const { content, folderName, fileName } = req.body; // Ensure fileName is provided

  try {
    // Define correct folder and file paths
    const folderPath = path.join(
      __dirname,
      "..",
      "userNotes",
      folderId,
      folderName
    );
    const filePath = path.join(folderPath, fileName); // Append filename

    // Check if folder exists
    try {
      fs.access(folderPath); // Check for directory, NOT file
    } catch (error) {
      return res.status(409).json({ msg: "Directory not found" });
    }

    // Write file asynchronously
    try {
      fs.writeFile(filePath, content, "utf-8");
      return res
        .status(201)
        .json({ msg: "File created successfully", path: filePath });
    } catch (error) {
      return res.status(500).json({ msg: "Error in creating file" });
    }
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

const updateFolder = async (req, res, next) => {
  const { oldName, newName } = req.body;
  const userId = req.user._id.toString();
  console.log("Reached")
  console.log(oldName , newName)
  const folderPath = path.join(__dirname, "..", "userNotes", userId);
  const oldFolderPath = path.join(folderPath, oldName);
  const newFolderPath = path.join(folderPath, newName);
  try {
    try {
      await fs.access(newFolderPath);
      return res
        .status(400)
        .send({ msg: "File name already exists, give a new name" });
    } catch {
      console.log("No dublicate");
    }

    try {
      await fs.rename(oldFolderPath, newFolderPath);
      return res.status(200).send({ msg: "File name updated" });
    } catch (error) {
      return res.status(400).send({ msg: "Error in server" });
    }
  } catch (error) {
    console.log(error)
    error.status = 500;
    next(500);
  }
};

const updateFileName = async (req, res, next) => {
  const { oldName, newName, folderName } = req.body;
  const userId = req.user._id.toString();
  const filePath = path.join(__dirname, "..", "userNotes", userId, folderName);
  const oldFilePath = path.join(filePath, oldName);
  const newFilePath = path.join(filePath, newName);

  try {
    // Check if new file name already exists
    try {
      await fs.access(newFilePath);
      return res
        .status(400)
        .send({ msg: "File name already exists, give a new name" });
    } catch {
      console.log("No dublicate");
    }

    // Rename file
    await fs.rename(oldFilePath, newFilePath);
    return res.status(200).send({ msg: "Name changed Successfully" });
  } catch (error) {
    console.error("Error renaming file:", error);
    next(new Error("Internal Server Error"));
  }
};

const updateFileContent = async (req, res, next) => {
  const { newContent, oldFileName, newFileName, folderName } = req.body;
  const userId = req.user._id.toString();

  const oldFilePath = path.resolve(
    __dirname,
    "..",
    "userNotes",
    userId,
    folderName,
    oldFileName
  );
  const newFilePath = path.resolve(
    __dirname,
    "..",
    "userNotes",
    userId,
    folderName,
    newFileName
  );

  try {
    // Check if the old file exists
    await fs.access(oldFilePath);
  } catch (error) {
    return res.status(404).json({ msg: "Original file not found" });
  }

  try {
    if (oldFilePath === newFilePath) {
      // just update content if there is same file
      await fs.writeFile(oldFilePath, newContent, "utf-8");
      return res.status(200).json({ msg: "File updated successfully" });
    } else {
      try {
        // If new file name exists already
        await fs.access(newFilePath);
        return res.status(400).json({ msg: "File name already exists" });
      } catch {
        //  New file name doesn't exist: safe to rename + update
        await fs.rename(oldFilePath, newFilePath);
        await fs.writeFile(newFilePath, newContent, "utf-8");
        return res.status(200).json({ msg: "File renamed and updated successfully" });
      }
    }
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ msg: "Something went wrong" });
  }
};


const deleteFile = async (req, res, next) => {
  const { fileName, folderName } = req.body;
  const userId = req.user._id.toString();
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "userNotes",
      userId,
      folderName,
      fileName
    );
    try {
      await fs.access(filePath);
      try {
        await fs.unlink(filePath);
        res.status(200).send({ msg: "File deleted" });
      } catch (err) {
        res.status(400).send({ msg: "Error in deleting file" });
      }
    } catch (error) {
      res.status(409).send({ msg: "File not found" });
    }
  } catch (error) {
    error.status = 500;
    next(error);
  }
};

const deleteFolder = async (req, res, next) => {
  const { folderName } = req.body;
  const userId = req.user._id.toString();
  try {
    const filePath = path.join(
      __dirname,
      "..",
      "userNotes",
      userId,
      folderName
    );
    try {
      await fs.access(filePath);
      try {
        await fs.rm(filePath, { recursive: true, force: true });
        res.status(200).send({ msg: "Folder deleted" });
      } catch (err) {
        res.status(400).send({ msg: "Error in deleting Folder" });
      }
    } catch (error) {
      res.status(409).send({ msg: "Folder not found" });
    }
  } catch (error) {
    error.status = 500;
    next(error);
  }
};

const fetchFolder = async (req, res , next) => {
  const userId = req.user._id.toString(); 
  try{
    const directoryPath = path.join(
      __dirname,
      "..",
      "userNotes",
      userId
    );

    try{
      const folders = await fs.readdir(directoryPath); 
      return res.status(200).send({msg : folders})
    }catch(error){
      return res.status(200).send({msg : "There is some error"}); 
    }

  }catch(error){
    error.status = 500;
    next(error)
  }
}

const fetchFile = async (req, res , next) => {
  const userId = req.user._id.toString(); 
  const {folderName} = req.body; 

  try{
    const directoryPath = path.join(
      __dirname,
      "..",
      "userNotes",
      userId, 
      folderName
    );

    try{
      const files = await fs.readdir(directoryPath); 
      console.log(files)
      return res.status(200).send({msg : files})
    }catch(error){
      console.log(error)
      return res.status(200).send({msg : "There is some error"});   
    }

  }catch(error){
    error.status = 500;
    next(error)
  }
}

const fetchFileContent = async (req, res , next) => {
  const userId = req.user._id.toString(); 
  const {folderName, fileName} = req.body; 
  console.log(fileName)
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
      console.log(files)
      return res.status(200).send({msg : files})
    }catch(error){
      console.log(error)
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
    console.log(file , folderName)
    if (!file) {
      console.log("Error")
      return res.status(400).send({msg : "No file uploaded"});
    }
    
    const uploadsDir = path.join(__dirname, ".." , "userNotes" , userId, folderName);
    const filePath = path.join(uploadsDir, file.originalname);
    
    try {
      console.log("processing")
      await fs.access(filePath);
      return res.status(400).send({msg : `File "${file.originalname}" already exists.`});
    } catch (err) {
      console.log("File doesn't exist")
    }

    await fs.writeFile(filePath, file.buffer);
    res.status(200).send({msg : `File "${file.originalname}" uploaded successfully!`});
    
  } catch (err) {
   err.status = 500;
   next(err)
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
  uploadFile
};
