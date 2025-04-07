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
        bookmarks : [{ type: mongoose.Schema.Types.ObjectId, ref: "Notes" }],
}); 

const User = new mongoose.model("User" , userSchema); 
module.exports = User; 