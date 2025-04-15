const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
        username :{ 
            type : String, 
            require : true
        }, 
        email :{ 
            type : String, 
            require : true
        }, 
        password :{ 
            type : String, 
            require : true
        }, 
        notes :[{ 
            type : mongoose.Schema.Types.ObjectId, 
            ref : 'Notes'
        }], 
        folders : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Folders'
        }],
        fileSharing : [{type : mongoose.Schema.Types.ObjectId, ref: 'fileSharing' }], 
        folderSharing : [{type : mongoose.Schema.Types.ObjectId, ref: 'folderSharing' }]
}); 

const User = new mongoose.model("User" , userSchema); 
module.exports = User; 