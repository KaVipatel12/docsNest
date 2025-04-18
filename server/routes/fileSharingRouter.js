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
router.route("/acceptfolder").post(authUser, fileSharingController.acceptFolder)     
router.route("/acceptfile").post(authUser, fileSharingController.acceptFile)     
router.route("/rejectFile").post(authUser, fileSharingController.rejectFile)     
router.route("/rejectFolder").post(authUser, fileSharingController.rejectFolder)     
router.route("/sharinghistory").get(authUser, fileSharingController.fetchHistory)     
router.route("/markseen").patch(authUser, fileSharingController.markSeen)     
router.route("/share/:userId/:fileName/").get(fileSharingController.showFileWithLink)     
router.route("/share/:userId/:folderName/:fileName").get(fileSharingController.showFolderFileWithLink)     
module.exports = router;