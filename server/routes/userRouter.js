const express = require("express"); 
const authUser = require("../middlewares/authMiddleWare");
const router = express.Router(); 
const userController = require("../controllers/userController")
const multer = require("multer")
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })
// creating notes using database
router.route("/addnote").post(authUser, userController.addNote)
router.route("/updatenote/:noteId").patch(authUser, userController.updateNote)
router.route("/deletenote/:noteId").delete(authUser, userController.deleteNote)
router.route("/addfavourite/:noteId").patch(authUser, userController.addFavourite)
router.route("/fetchuserdata").get(authUser, userController.fetchUserData)
router.route("/fetchallusers").post(userController.fetchAllUsers)
router.route("/modifyfileaccess").post(authUser , userController.modifyFileAccess)
router.route("/modifyfolderfileaccess").post(authUser , userController.modifyFolderFileAccess)
router.route("/uploadfile").post(authUser , upload.single("file") , userController.uploadFile)

module.exports = router; 