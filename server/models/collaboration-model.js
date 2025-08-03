const mongoose = require("mongoose")

const fileCollabSchema = mongoose.Schema({
        title :{ 
            type : String, 
            require : true
        }, 
        description :{ 
            type : String, 
            require : true
        },
        noteId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notes",
        },
        ownerId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
        editedBy : {
            type : mongoose.Schema.Types.ObjectId, 
            ref : "Users"
        }
}); 


const folderCollabSchema = mongoose.Schema({
        folder : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folders",
        },
        fileName :{ 
            type : String, 
            require : true
        }, 
        content :{ 
            type : String, 
            require : true
        },
        editedBy : {
            type : mongoose.Schema.Types.ObjectId, 
            ref : "Users"
        },
        ownerId : {
            type : mongoose.Schema.Types.ObjectId, 
            ref : "Users"
        }
}); 

const folderCollab = new mongoose.model("folderCollab" , folderCollabSchema); 
const fileCollab = new mongoose.model("fileCollab" , fileCollabSchema); 

module.exports = {folderCollab , fileCollab}