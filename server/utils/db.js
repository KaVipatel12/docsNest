const mongoose = require('mongoose'); 

const connectDB = async () => {
    try{

        const conn = await mongoose.connect(process.env.MONGODB_URI); 
        console.log("Mongodb connected", conn.connection.host)
    }catch(error){
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process with failure
    }
}

module.exports = connectDB; 