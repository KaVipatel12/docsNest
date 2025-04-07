const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

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


module.exports = { register, login };
