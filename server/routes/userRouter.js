const express = require("express"); 
const authUser = require("../middlewares/authMiddleWare");
const router = express.Router(); 
const userController = require("../controllers/userController")

// creating notes using database
router.route("/addnote").post(authUser, userController.addNote)
router.route("/updatenote/:noteId").patch(authUser, userController.updateNote)
router.route("/deletenote/:noteId").delete(authUser, userController.deleteNote)
router.route("/bookmark/:noteId").patch(authUser, userController.bookMark)
router.route("/fetchuserdata").get(authUser, userController.fetchUserData)
router.route("/fetchallusers").post(userController.fetchAllUsers)
router.route("/modifyfileaccess").post(authUser , userController.modifyFileAccess)
router.route("/modifyfolderfileaccess").post(authUser , userController.modifyFolderFileAccess)
module.exports = router; 