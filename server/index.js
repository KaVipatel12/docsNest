require("dotenv").config({path : "./.env"})
const express = require("express"); 
const app = express(); 
const cors = require("cors")
const connectDB = require("./utils/db")

app.use(express.json()); 
app.use(express.urlencoded({extended : true})); 

const authRouter = require("./routes/authRouter"); 
const userRouter = require("./routes/userRouter"); 
const userFileRouter = require("./routes/userFileRouter"); 
const errorMiddleware = require("./middlewares/errorMiddleWare");

app.use(cors({
    origin : [process.env.REACT_APP_URL], 
    methods : ['GET' , 'POST' , 'PUT' , 'PATCH' , 'DELETE'], 
    credentials : true
})); 

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/user/file", userFileRouter)

app.use(errorMiddleware)

connectDB().then(() => {
    app.listen(8000 , ()=>{
        console.log("App listening on port")
    })
})