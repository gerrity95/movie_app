const express = require('express');
const router = express.Router();


router.get("/password_reset", (req,res) =>{
    res.render("password_forget");
  })


module.exports = router