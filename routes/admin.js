const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const User = require('../models/User');





router.get('/', (req,res) => {
    User.find({}, (err, listUser) => {
      
      res.render('admin', {newlistUser : listUser  })
      
    })
  })
  
router.get('/teacher', (req, res) => {

  User.find({ isTeacher : 'true' }, (err,listTeacher) => {
    if(!err) 
    res.render('admin-teacher', {newTeacherList : listTeacher})
  })
})

router.get('/user', (req,res) => {

  User.find({  isTeacher: 'false'}, (err,listUser) => {
    res.render('admin-user', {newlistUser : listUser  })

  });

    
  })
  

  router.get('/profile', (req,res) => {

   res.render('admin-profile');
      
    })
  





module.exports = router;
