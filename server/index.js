require("dotenv").config({path : "./.env"})
const express = require("express"); 
const app = express(); 
const cors = require("cors")
const connectDB = require("./utils/db")
const session = require('express-session');
const helmet = require('helmet');
const port = process.env.PORT || 8000
app.use(express.json()); 
app.use(express.urlencoded({extended : true})); 

const authRouter = require("./routes/authRouter"); 
const userRouter = require("./routes/userRouter"); 
const userFileRouter = require("./routes/userFileRouter"); 
const errorMiddleware = require("./middlewares/errorMiddleWare");
const fileSharingRouter = require("./routes/fileSharingRouter")
// const fileCollaborationRouter = require("./routes/fileCollaborationRouter")

app.use(helmet());

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only secure if production
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 10 * 60 * 1000 // 10 minutes
  }
}));
app.use(cors({
    origin : process.env.CLIENT_APP_URL, 
    methods : ['GET' , 'POST' , 'PUT' , 'PATCH' , 'DELETE'], 
    credentials : true
})); 

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/user/file", userFileRouter)
app.use("/api/filesharing", fileSharingRouter)
// app.use("/api/filecollaboration", fileCollaborationRouter)

app.use(errorMiddleware)

connectDB().then(() => {
    app.listen(port , ()=>{
        console.log("App listening on port")
    })
})