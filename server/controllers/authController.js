const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(401).send({ msg: "Email already exists" });
    }

    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    const addUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (!addUser) {
      return res.status(401).send({ msg: "Error is registering" });
    }

    const token = jwt.sign(
      { id: addUser._id, email: addUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.status(201).json({
      msg: "Registration Successful",
      token: token,
      userId: addUser._id.toString(),
    });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(404).send({ msg: "Invalid Credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
      return res.status(401).send({ msg: "Invalid Credentials" });
    }

    let token = jwt.sign(
      {
        email,
        username: findUser.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).send({ msg: "Login successful", token });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

const sendOtpEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  
try{  
  if (!user) {
    return res.status(401).send({ msg: "Invalid Email" }); 
  } else {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const transporter = nodemailer.createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, 
          auth: {
              user: "kushpatel24811@gmail.com",
              pass: process.env.APP_PASSWORD,
          },
      });

      const mailOptions = {
          from: {
              name: 'DocsNest',
              address:process.env.GMAIL_USER,
            },
            to: email,
          subject: "Here is your one time OTP to update the password",
          text: otp,
      };

      try {
        await transporter.sendMail(mailOptions);
        if (!req.session) {
          return res.status(500).send({ msg: "Session is not initialized properly" });
          }
          req.session.otp = otp;
          req.session.email = email;
          res.status(200).send({ msg: 'OTP sent, OTP has been sent to your email'});
      } catch (error) {
          res.status(500).send({ msg: "There is some error in the server, please try again later" });
        }
      }
    }catch(error){
  res.status(500).send({ msg: "There is some error in the server, please try again later" });
}
}

const otpVerification = async (req, res) => {
  try {
      const { otp } = req.body;
      const otpSession = req.session.otp

      if (!otpSession) {
          return res.status(401).send({ msg: "OTP expired."});  
      }

      if (otp !== otpSession) {
          return res.status(400).send({ msg: "Enter the correct OTP" });  
      }

      return res.status(200).send({ msg: "OTP verification successful" });

  } catch (error) {
      return res.status(500).send({ msg: "An error occurred while verifying OTP. Please try again later." });
  }
};

const newPassword = async (req, res) => {
  try {
      const { password } = req.body;
      const email = req.session.email;
      const otp = req.session.otp;

      if (!otp || !email) {
          return res.status(401).send({ msg: "Unauthorized Access" });
      }

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).send({ msg: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      await user.save();

      req.session.otp = null;
      req.session.email = null;

      res.status(200).send({ msg: "Password updated successfully" });
  } catch (error) {
      res.status(500).send({ msg: "Something went wrong, please try again later" });
  }
};


module.exports = { 
  register, 
  login , 
  sendOtpEmail, 
  otpVerification, 
  newPassword
};
