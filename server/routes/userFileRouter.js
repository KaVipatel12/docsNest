const express = require("express"); 
const authUser = require("../middlewares/authMiddleWare");
const router = express.Router(); 
const userFileController = require("../controllers/userFileController")
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// creating notes using file operations (User can create folder structure for notes); 
router.route("/createfolder").post(authUser, userFileController.createFolder)
router.route("/createfile").post(authUser, userFileController.createFile)
router.route("/updatefolder").patch(authUser, userFileController.updateFolder)
router.route("/updatefile").patch(authUser, userFileController.updateFileName)
router.route("/updatefilecontent").patch(authUser, userFileController.updateFileContent)
router.route("/deletefile").patch(authUser, userFileController.deleteFile)
router.route("/deletefolder").patch(authUser, userFileController.deleteFolder)
router.route("/fetchfolder").get(authUser, userFileController.fetchFolder)     
router.route("/fetchfile").post(authUser, userFileController.fetchFile)    // fetching file name in a specific folder
router.route("/fetchfilecontent").post(authUser, userFileController.fetchFileContent)    // fetching file name in a specific folder
router.route("/addfavourite/:folderName/:fileName").patch(authUser, userFileController.addFavourite)    // fetching file name in a specific folder
router.route("/uploadfile").post(authUser, upload.single("file") ,userFileController.uploadFile)     
module.exports = router;