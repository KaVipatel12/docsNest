const express = require("express"); 
const authUser = require("../middlewares/authMiddleWare");
const router = express.Router(); 
const fileSharingController = require("../controllers/fileSharingController")
// const multer = require("multer");

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

router.route("/sharefile").post(authUser, fileSharingController.sendFileToUser)     
router.route("/receivefile").get(authUser, fileSharingController.receiverFile)     
router.route("/sharefolder").post(authUser, fileSharingController.sendFolderToUser)     
router.route("/receivefolder").get(authUser, fileSharingController.receiveFolder)     
module.exports = router;