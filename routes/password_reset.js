const express = require('express');
const router = express.Router();
const User = require("../models/user");
const crypto = require("crypto");
const Token = require("../models/token");
const email = require('../config/email')
const email_transporter = email.transporter;
const dotenv = require('dotenv');
dotenv.config();

router.get("/password_reset", (req,res) =>{
    res.render("password_forget");
  })

router.post('/api/email_test', async(req, res) =>{
    console.log("Email test");
    // send mail with defined transport object
    let info = await email.send_email("bar@example.com", "Hello Subject", "<b>Hello world?</b>");
    return res.json({"email": info});
  });

router.post("/password_reset", async (req, res) => {
  var url = req.get('referer').split('?')[0];
  try {

      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        console.log("Email doesn't exist when attempting to reset password..");
        return res.redirect(url + "?EmailDoesNotExist=True");
      }
      console.log("Successfully found user...")

      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        console.log("Creating new token...");
          token = await new Token({
              userId: user._id,
              token: crypto.randomBytes(32).toString("hex"),
          }).save();
      }

      console.log("Token Created...")

      const link = `${process.env.BASE_URL}/${user._id}/${token.token}`;
      await email.send_email(user.email, "Password reset", link);

      return res.redirect(url + "?TokenSent=True");
  } catch (error) {
      res.send("An error occured");
      console.log(error);
  }
});

router.post("/:userId/:token", async (req, res) => {
    try {

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(400).send("invalid link or expired");

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link or expired");

        await user.setPassword(req.body.reset_password, async function(err,user){
          if(err){
            console.log("Error: " + err.name + "when attempting to update user password");
            console.log(err);
            return res.status(500).send(error);
          }
          console.log("USER")
          console.log(user);
          console.log('Successfully updated password for: ' + user.email);
          await user.save();
          await token.delete();
        })

        return res.render("login", {password_reset: true});
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
});

router.get("/:userId/:token", async (req, res) => {
  try {

      const user = await User.findById(req.params.userId);
      if (!user) return res.status(400).send("invalid link or expired");

      const token = await Token.findOne({
          userId: user._id,
          token: req.params.token,
      });
      if (!token) return res.status(400).send("Invalid link or expired");

  } catch (error) {
      res.send("An error occured");
      console.log(error);
  }

  return res.render("password_reset", {user_id: req.params.userId, token: req.params.token});
});



module.exports = router