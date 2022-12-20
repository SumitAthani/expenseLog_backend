const express = require("express");
const User = require("../models/Users");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Schema } = require("mongoose");
const { json } = require("express/lib/response");
require("dotenv").config();
const nodemailer = require("nodemailer");

router.get("/", (req, res) => {
  res.send("User page");
  // const Years = new Schema();
  // Years.add({
  //   years: {
  //   type: Array,
  //   required: false,
  //   default: []
  // }
  // })
  // User.updateMany({ enabled : { $exists : false } }, { enabled : false } );
});

router.post("/login", async (req, res) => {
  console.log("herer");
  const user = await User.findOne({ email: req.body.email });

  console.log(req.body);

  if (user == null) {
    return res.status(401).json({
      message: "Auth Failed1",
    });
  } else {
    bcrypt.compare(req.body.password, user.password, (e, result) => {
      if (e) {
        return res.status(401).json({
          message: "Auth Failed",
        });
      }
      if (result) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
            username: user.username,
          },
          process.env.JWT_KEY
        );

        res.status(200).json({
          token: token,
        });
      } else {
        return res.status(401).json({ message: "Auth Failed" });
      }
    });
  }
});

router.post("/signup", async (req, res) => {
  console.log("signip here");

  const user = await User.findOne({ email: req.body.email });
  if (user != null) {
    res.status(409).json({
      message: "User already exists",
    });
  } else {
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        const user = await new User({
          username: req.body.username,
          email: req.body.email,
          password: hash,
        });

        try {
          await user.save();
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
              username: user.username,
            },
            process.env.JWT_KEY
          );
          res.status(201).json({
            token: token,
            message: "User Created",
          });
        } catch (error) {
          res.status(500).json({ error: error });
        }
      }
    });
  }
});

router.post("/check-email", async (req, res) => {
  console.log("checking email");
  email = req.body.email;

  var user = await User.findOne({
    email: email,
  });

  if (user == null) {
    return res.status(401).json({ message: "not a valid email" });
  } else {
    let token = Math.floor(100000 + Math.random() * 900000);

    user.token.push(token);

    await user.save();

    var transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sstechnology12345",
        pass: process.env.EMAIL_PASS,
      },
    });

    var mailOptions = {
      from: "Sumit Athani",
      to: email,
      subject: "Request for password change",
      text: `Below is the password reset token:\n ${token}\n\n Do not share the token with anybody\n`,
      // html: "<h4>Below is the password reset token token:\n ${token}\n\n Do not share the token with anybody.\n Ignore if its not you. If your password is weak please go ahead and set a strong password</h4>"
    };

    await transporter.sendMail(mailOptions, function (e, i) {
      if (e) {
        console.log(e);
        return res.status(504).json({
          message: "Email not sent",
        });
      } else {
        console.log("Email sent: ", i.response);
        return res.status(200).json({
          message: "Email sent",
        });
      }
    });
  }
});

router.post("/check-token", async (req, res) => {
  email = req.body.email;
  token = req.body.token;

  var user = await User.findOne({
    email: email,
  });

  console.log(user);

  if (user.token.includes(token)) {
    console.log("token valid");
    return res.status(200).json({ message: "valid token" });
  } else {
    console.log("Token invlid");
    return res.status(401).json({ message: "invalid token" });
  }
});

router.post("/reset-password", async (req, res) => {
  email = req.body.email;
  token = req.body.token;
  password = req.body.password;

  console.log(req.body);

  var user = await User.findOne({
    email: email,
  });

  if (user.token.includes(token)) {
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({ message: "could not update password" });
      } else {
        user.password = hash;
        user.token = [];
        await user.save();
        return res.status(200).json({ message: "password updated" });
      }
    });
  } else {
    console.log("token invalid");
    return res.status(200).json({ message: "invalid token" });
  }
});

module.exports = router;
