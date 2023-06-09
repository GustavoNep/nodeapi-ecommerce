const router = require("express").Router();
const User = require("../models/User");

const jwt = require("jsonwebtoken");

const CryptoJS = require("crypto-js");

//REGISTER

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    // se n tiver nenhum usuario faça
    !user && res.status(401).json("Wrong Credentials!");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );

    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    OriginalPassword !== req.body.password.toString(CryptoJS.enc.Utf8) &&
      res.status(401).json("Wrong Credentials!");

    const acessToken = jwt.sign({
      id: user._id,
      isAdmin: user.isAdmin,
    }, process.env.JWT_SEC, {expiresIn: "3d"});

    const { password, ...others } = user._doc;

    res.status(200).json({...others, acessToken});
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
