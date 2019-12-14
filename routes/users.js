const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');


// users/"route"

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Lesson Page
router.get('/lesson1', (req, res, ) =>  res.render('lesson1', {user: req.user}));

router.get('/info', (req,res) => res.render('info', {user: req.user}));




// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Sila lengkapkan semua ruangan.' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords konfirmasi tidak sama.' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Passwords mesti sekurang-kurangnya 6 aksara.' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email dalam rekod sistem.' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
       if(req.body.secretCode === 'secret101'){
         newUser.isTeacher = true;
       } 
      
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'Anda sudah berjaya mendaftar. Teruskan dengan login.'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    badRequestMessage: 'There is something wrong.', //missing credentials
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Anda sudah log keluar. Jumpa lagi.');
  res.redirect('/users/login');
});



module.exports = router;