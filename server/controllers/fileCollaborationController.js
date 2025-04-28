// const User = require("../models/user-model");
// const fileSharing = require("../models/file_sharing-model");
// const folderSharing = require("../models/folder_sharing-model");
// const Folder = require("../models/folder-model");
// const Notes = require("../models/note-model");

// // Handeling and updating collaboration model if user is changing the note

// const noteChanges = async (req , res , next) => {
//     try{
//         const userId = req.user.Id
//         const {title, description , noteId , ownerId , password} = req.body;  
        
//         if(title.length === 0 || description.length === 0){
//             return res.status(400).send({msg : "Content missing"}); 
//         }

//         const fetchNote = await Notes.findById(noteId); 
//         const verifyPassword = fetchNote.password === password.toString(); 

//         if(!verifyPassword){
//             return res.status(400).send({msg : " Enter the valid password"}); 
//         }

//         console.log("Password matched"); 
//     }catch(err){
//         console.log(err)
//     }
// }
// module.exports = {noteChanges};
