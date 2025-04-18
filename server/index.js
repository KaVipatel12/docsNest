require("dotenv").config({path : "./.env"})
const express = require("express"); 
const app = express(); 
const cors = require("cors")
const connectDB = require("./utils/db")
const helmet = require('helmet');
const port = process.env.PORT || 8000
app.use(express.json()); 
app.use(express.urlencoded({extended : true})); 

const authRouter = require("./routes/authRouter"); 
const userRouter = require("./routes/userRouter"); 
const userFileRouter = require("./routes/userFileRouter"); 
const errorMiddleware = require("./middlewares/errorMiddleWare");
const fileSharingRouter = require("./routes/fileSharingRouter")

app.use(helmet());
app.use(cors({
    origin : process.env.CLIENT_APP_URL, 
    methods : ['GET' , 'POST' , 'PUT' , 'PATCH' , 'DELETE'], 
    credentials : true
})); 

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/user/file", userFileRouter)
app.use("/api/filesharing", fileSharingRouter)

app.use(errorMiddleware)

connectDB().then(() => {
    app.listen(port , ()=>{
        console.log("App listening on port")
    })
})