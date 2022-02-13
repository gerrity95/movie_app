const express = require('express');
const router = express.Router();
const User = require("../models/user");
const crypto = require("crypto");
const Token = require("../models/token");
const helpers = require('./helpers/generic_helpers');
const email = require('../config/email');
const email_transporter = email.transporter;
const dotenv = require('dotenv');
dotenv.config();

router.get("/password_reset", (req,res) =>{
    res.render("password_forget");
  })

/*
router.post('/api/email_test', async(req, res) =>{
    console.log("Email test");
    // send mail with defined transport object
    let info = await email.send_email("bar@example.com", "Hello Subject", "<b>Hello world?</b>");
    return res.json({"email": info});
  });
*/
router.post("/password_reset", async (req, res) => {
  var url = req.get('referer').split('?')[0];
  try {

      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        console.log("Email doesn't exist when attempting to reset password..");
        return res.redirect(url + "?EmailDoesNotExist=True");
      }
      console.log("Successfully found user...");

      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        console.log("Creating new token...");
          token = await new Token({
              userId: user._id,
              token: crypto.randomBytes(32).toString("hex"),
          }).save();
      }

      console.log("Token Created...")

      html_message = `
      <center><img src="192.168.1.6:3000/images/what_to_watch_black.png"></center><br><br>
      Dear ${user.first_name} ${user.last_name},<br><br><p>A request to reset your password has been made. 
      If you want to reset your password you can <a href="${process.env.BASE_URL}/${user._id}/${token.token}" target="_blank">
      reset it here.</a></p><br><p><b>Please note</b> For security reasons this link will expire after 2 hours. If you do not reset
      before then, you will need to try again.</p><br><p>If the above link isn't
      working you can paste the following link into your address bar: 
      <a href="${process.env.BASE_URL}/${user._id}/${token.token}" target="_blank">${process.env.BASE_URL}/${user._id}/${token.token}</a></p><br><p>Many Thanks for using What To Watch</p><br>`
      
      const link = `<a href="${process.env.BASE_URL}/${user._id}/${token.token}" target="_blank">Password Reset Link</a>`;
      await email.send_email(user.email, "What To Watch - Password reset", html_message);

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

        let is_valid_pword = helpers.is_valid_password(req.body.reset_password);

        if (is_valid_pword !== true) {
          console.log("Password does not meet requirements.");
          return res.render("password_reset", {user_id: req.params.userId, token: req.params.token, fail_message: is_valid_pword});
        }

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

        return res.redirect("/login?password_reset=True");
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