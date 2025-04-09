const express = require("express"); 
const authUser = require("../middlewares/authMiddleWare");
const router = express.Router(); 
const fileSharingController = require("../controllers/fileSharingController")
// const multer = require("multer");

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

router.route("/sharefileandfolder").post(authUser, fileSharingController.shareFilesAndFolders)     
router.route("/receivefile").get(authUser, fileSharingController.receiverFile)     
router.route("/receivefolder").get(authUser, fileSharingController.receiveFolder)     
module.exports = router;