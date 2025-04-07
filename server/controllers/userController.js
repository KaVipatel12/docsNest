const User = require("../models/user-model");
const Note = require("../models/note-model");
const fs = require("fs");
const path = require('path')
const addNote = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, description } = req.body;

    const createNewNote = new Note({
      user: userId,
      title,
      description,
    });
    let createdNote = await createNewNote.save();

    await User.findByIdAndUpdate(
      userId,
      {
        $push: { notes: createdNote._id },
      },
      { new: true }
    );

    if (!createdNote) {
      return res.status(402).send({ msg: "Couldn't add the note" });
    }
    res.status(200).send({ msg: "Note added successfully" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { newTitle, newDescription } = req.body;
    const noteId = req.params.noteId;
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        $set: {
          title: newTitle,
          description: newDescription,
        },
      },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(400).send({ msg: "Note not found!" });
    }

    res.status(200).send({ msg: "Note updated successfully!" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.noteId;
    console.log("Note id : ", noteId)
    const deletedNote = await Note.findByIdAndDelete(noteId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { notes: noteId } },
      { new: true }
    );
    if (!deletedNote || !updatedUser) {
      return res.status(400).send({ msg: "Note not found!" });
    }
    res.status(200).send({ msg: "Note deleted successfully!" });
  } catch (err) {
    console.log(err)
    err.status = 500;
    next(err);
  }
};

const bookMark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.noteId;

    const findBookmark = await User.findOne({
      _id: userId,
      bookmarks: { $elemMatch: { $eq: noteId } },
    });

    if (findBookmark) {
       await User.findOneAndUpdate(
        userId,
        {
          $pull: {
            bookmarks: noteId,
          },
        },
        { new: true }
      );
      return res.status(200).send({ msg: "Book mark removed" });
    }
     await User.findOneAndUpdate(
      userId,
      {
        $push: {
          bookmarks: noteId,
        },
      },
      { new: true }
    );
    res.status(200).send({ msg: "bookmark added" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

// fetching notes as well as bookmarks as well as user profile.

const fetchUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log(userId)
    const fetchedNotes = await User.findById(userId).populate("notes").populate("bookmarks");
    if (!fetchedNotes) {
      return res.status(409).send({ msg: "Notes not Found" });
    }
    res.status(200).send({ msg: fetchedNotes });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

module.exports = {
  addNote,
  updateNote,
  deleteNote,
  bookMark,
  fetchUserData
};