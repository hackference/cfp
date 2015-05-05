var express = require('express');
var router  = express.Router();
var utils   = require(__dirname + '/../lib/utils');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'CFP' });
});

/* GET login page. */
router.get('/login', function(req, res) {
  res.render('login', { title: 'CFP' });
});

/* GET logout page. */
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

/* GET contact page. */
router.get('/contact', function(req, res) {
  res.render('contact', { title: 'Contact Us About Hackference' });
});

module.exports = router;
