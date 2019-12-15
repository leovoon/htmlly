module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Sila log masuk untuk akses.');
    res.redirect('/users/login');
  },
  ensureAuthenticatedAdmin: function (req, res, next) {

    
      if (req.user && req.user.isAdmin === true){
        return next();
    }
    console.log("auth error..")
    res.redirect('/admin/login');
  },
  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');
  }
};