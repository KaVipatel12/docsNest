const Folders = require("../models/folder-model");
const User = require("../models/user-model");

const createFolder = async (req, res, next) => {
  const { folderName } = req.body;
  const userId = req.user._id;

  try {
    const exists = await Folders.findOne({ user: userId, folderName });

    if (exists) {
      return res.status(400).json({ message: "Folder already exists" });
    }

    return res.status(201).json({
      message: "Folder created successfully",
      path: folderName,
    });
  } catch (error) {
    next(new Error("Internal Server Error"));
  }
};

const createFile = async (req, res, next) => {
  const userId = req.user._id;
  const { content, folderName, fileName } = req.body;

  if (!fileName || !content) {
    return res.status(400).json({ msg: "File name and content are required." });
  }

  try {
    const existing = await Folders.findOne({ user: userId, folderName, fileName });
    if (existing) {
      return res.status(409).json({ msg: "File already exists." });
    }

    const fileDoc = await Folders.create({
      user: userId,
      folderName,
      fileName,
      content,
    });

    await User.findByIdAndUpdate(
      userId,
      { $push: { folders: fileDoc._id } },
      { new: true }
    );

    return res.status(201).json({ msg: "File created successfully", path: fileName });
  } catch (err) {
    next(err);
  }
};

const updateFolder = async (req, res, next) => {
  const { oldName, newName } = req.body;
  const userId = req.user._id;

  try {
    const exists = await Folders.findOne({ user: userId, folderName: newName });
    if (exists) {
      return res.status(400).send({ msg: "Folder name already exists" });
    }

    await Folders.updateMany({ user: userId, folderName: oldName }, { folderName: newName });
    return res.status(200).send({ msg: "Folder name updated" });
  } catch (error) {
    next(error);
  }
};

const updateFileName = async (req, res, next) => {
  const { oldName, newName, folderName } = req.body;
  const userId = req.user._id;

  try {
    const exists = await Folders.findOne({ user: userId, folderName, fileName: newName });
    if (exists) {
      return res.status(400).send({ msg: "File name already exists" });
    }

    await Folders.findOneAndUpdate(
      { user: userId, folderName, fileName: oldName },
      { fileName: newName }
    );

    return res.status(200).send({ msg: "File name changed successfully" });
  } catch (error) {
    next(error);
  }
};

const updateFileContent = async (req, res, next) => {
  const { newContent, oldFileName, newFileName, folderName } = req.body;
  const userId = req.user._id;

  try {
    const file = await Folders.findOne({ user: userId, folderName, fileName: oldFileName });
    if (!file) return res.status(404).json({ msg: "Original file not found" });

    if (oldFileName !== newFileName) {
      const nameTaken = await Folders.findOne({ user: userId, folderName, fileName: newFileName });
      if (nameTaken) return res.status(400).json({ msg: "File name already exists" });

      file.fileName = newFileName;
    }

    file.content = newContent;
    await file.save();

    return res.status(200).json({ msg: "File updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  const { fileName, folderName } = req.body;
  const userId = req.user._id;

  try {
    const deletedDoc = await Folders.findOneAndDelete({ user: userId, folderName, fileName });

    if (deletedDoc) {
      await User.findByIdAndUpdate(userId, {
        $pull: { folders: deletedDoc._id },
      });
    }

    return res.status(200).send({ msg: "File deleted" });
  } catch (error) {
    next(error);
  }
};

const deleteFolder = async (req, res, next) => {
  const { folderName } = req.body;
  const userId = req.user._id;

  try {
    const deletedFiles = await Folders.find({ user: userId, folderName });
    if (!deletedFiles.length) {
      return res.status(409).send({ msg: "Folder not found or error deleting folder" });
    }

    const deletedIds = deletedFiles.map((file) => file._id);
    await User.findByIdAndUpdate(userId, {
      $pull: { folders: { $in: deletedIds } },
    });

    await Folders.deleteMany({ user: userId, folderName });

    return res.status(200).send({ msg: "Folder and its files deleted" });
  } catch (error) {
    next(error);
  }
};

const fetchFolder = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const folderList = await Folders.distinct("folderName", { user: userId });
    return res.status(200).json({ msg: folderList });
  } catch (error) {
    next(error);
  }
};

const fetchFile = async (req, res, next) => {
  const userId = req.user._id;
  const { folderName } = req.body;

  try {
    const fileDocs = await Folders.find({ user: userId, folderName });

    const filesWithFav = fileDocs.map((doc) => ({
      fileName: doc.fileName,
      isFavorite: doc.favourite,
    })).sort((a, b) => b.isFavorite - a.isFavorite);

    return res.status(200).send({ msg: filesWithFav });
  } catch (error) {
    next(error);
  }
};

const fetchFileContent = async (req, res, next) => {
  const userId = req.user._id;
  const { folderName, fileName } = req.body;

  try {
    const file = await Folders.findOne({ user: userId, folderName, fileName });
    if (!file) return res.status(404).send({ msg: "File not found" });

    return res.status(200).send({ msg: file, access: file.access });
  } catch (error) {
    next(error);
  }
};

const uploadFile = async (req, res, next) => {
  const file = req.file;
  const userId = req.user._id;
  const { folderName } = req.body;

  if (!file) {
    return res.status(400).send({ msg: "No file uploaded" });
  }

  try {
    const exists = await Folders.findOne({ user: userId, folderName, fileName: file.originalname });
    if (exists) {
      return res.status(400).send({ msg: `File "${file.originalname}" already exists.` });
    }

    await Folders.create({
      user: userId,
      folderName,
      fileName: file.originalname,
      content: file.buffer.toString(),
    });

    return res.status(200).send({ msg: `File "${file.originalname}" uploaded successfully!` });
  } catch (err) {
    next(err);
  }
};

const addFavourite = async (req, res, next) => {
  const user = req.user._id;
  const { fileName, folderName } = req.params;

  try {
    let newFileName = fileName.split("_").join(" ")
    const file = await Folders.findOne({ user, folderName, fileName : newFileName});

    if (!file) {
      return res.status(404).send({ msg: "File not found" });
    }

    file.favourite = !file.favourite;
    await file.save();

    res.status(200).send({
      msg: file.favourite ? "Added to favourites" : "Removed from favourites",
      favourite: file.favourite
    });

  } catch (err) {
    console.error("Error toggling favourite:", err);
    next(err);
  }
};


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
