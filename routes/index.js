const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const User = require('../models/User');


// No log in user can access
router.get('/codeplay', (req, res) => {
  res.render('codeplay', {user: req.user});
})

router.get('/info', (req,res) => res.render('info', {user: req.user}));

router.get('/contact-form', (req,res) => {
    res.render('contact-form', {user: req.user})
})

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('index'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

// Dashboard POST contact form
router.post('/dashboard', (req, res) => {
"use strict";

  let sender_name = req.body.name;
  let sender_email = req.body.email;
  let sender_subject = req.body.subject;
  let sender_message = req.body.message;
  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_EMAIL, //  gmail user
        pass: process.env.GMAIL_PASS //  gmail password
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "sender_email", // this is ignored by Gmail
      to: "voonlihhaur@gmail.com", // list of receivers
      subject: `New Message from htmly : ${sender_subject}`, // Subject line
      text: `${sender_name} (${req.body.email}) says: ${sender_message}` // plain text body
    });

    console.log("Message sent: %s", info.messageId);
  }

  main().catch(console.error);
  res.end(res.redirect("/contact-form"));
});



 
// Kuiz 
router.get('/kuiz', ensureAuthenticated, (req, res) =>{
    res.render('kuiz', {
        user: req.user
    });
  
});
// Chat 
router.get('/chat', ensureAuthenticated, (req, res) =>{
    res.render('chat', {
        user: req.user
    });
  
});

router.get('/chatRoom', ensureAuthenticated, (req, res) => {
  res.render('chatRoom', {user : req.user});
})


 // lesson page
router.get('/lesson1', (req, res) =>{
    res.render('lesson1', {user : req.user})
    
});





module.exports = router;
