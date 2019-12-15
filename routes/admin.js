const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const {
  forwardAuthenticated,
  ensureAuthenticatedAdmin
} = require('../config/auth');


router.get('/login', forwardAuthenticated, (req, res) => res.render('admin-login'));






// Login
router.post('/login', (req, res, next) => {
      
        passport.authenticate('local', {  
          successRedirect: '/admin-user',
          failureRedirect: '/login',
          badRequestMessage: 'There is something wrong.', //missing credentials
          failureFlash: true
        })(req, res, next);
      
      });

    // Logout
    router.get('/logout', (req, res) => {
      req.logout();
      req.flash('success_msg', 'Anda sudah log keluar. Jumpa lagi.');
      res.redirect('/admin/login');
    });





    router.get('/', ensureAuthenticatedAdmin, (req, res) => {
      res.render("admin", {
        viewTitle: " Add User",
        user: req.body,
        _id: req.body._id

      });
    });

    router.post('/', (req, res) => {
      if (req.body._id == '')
        insertRecord(req, res);
      else
        updateRecord(req, res);
    });



    function insertRecord(req, res) {

      const {
        name,
        email,
        password,
        isTeacher
      } = req.body;


      const newUser = new User({
        name,
        email,
        password,
        isTeacher

      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              req.flash(
                'success_msg',
                'User added succesfully.'
              );
              res.redirect('/admin/admin-user');
            })
            .catch(err => console.log(err));
        });
      });

    }




    function updateRecord(req, res) {
      User.findOneAndUpdate({
        _id: req.body._id
      }, req.body, {
        new: true
      }, (err, doc) => {
        if (!err) {
          res.redirect('/admin/admin-user');
        } else {
          if (err.name == 'ValidationError') {
            handleValidationError(err, req.body);
            res.render("admin", {
              viewTitle: 'Update User',
              user: req.body
            });
          } else
            console.log('Error during record update : ' + err);
        }
      });
    }


    router.get('/admin-user',  ensureAuthenticatedAdmin, (req, res) => {
      User.find((err, docs) => {
        if (!err) {
          res.render("admin-user", {
            list: docs
          });
        } else {
          console.log('Error in retrieving user list :' + err);
        }
      });
    });


    function handleValidationError(err, body) {
      for (field in err.errors) {
        switch (err.errors[field].path) {
          case 'name':
            body['name'] = err.errors[field].message;
            break;
          case 'email':
            body['emailError'] = err.errors[field].message;
            break;
          default:
            break;
        }
      }
    }

    router.get('/:id', (req, res) => {
      User.findById(req.params.id, (err, doc) => {
        if (!err) {
          res.render("admin", {
            viewTitle: "Update User",
            user: doc
          });
        }
      });
    });

    router.get('/delete/:id', (req, res) => {
      User.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
          res.redirect('/admin/admin-user');
        } else {
          console.log('Error in user delete :' + err);
        }
      });
    });

 

    module.exports = router;