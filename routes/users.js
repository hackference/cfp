var express = require('express');
var router  = express.Router();
var user    = require(__dirname + '/../lib/user');
var utils   = require(__dirname + '/../lib/utils');
var _       = require('lodash');
var extend  = require('util')._extend;

// Required user params
var requiredParams = utils.userRequiredParams;

// Talk Types
var experienceTypes = [
  {
    value: 'new',
    name: 'New'
  },
  {
    value: 'confident',
    name: 'Confident'
  },
  {
    value: 'professional',
    name: 'Professional'
  }
]

/* GET user profile. */
router.get('/', function(req, res) {
  var possibleAvatars = utils.userImages(req.user);
  res.render('user/profile', { title: 'Your speaker profile', user: req.user, experienceTypes: experienceTypes, possibleAvatars: possibleAvatars })
});

/* POST user profile */
router.post('/', function(req, res) {
  // User ID
  var userId = req.user.id;

  // Check all the required params have been submitted
  for (i = 0; i < requiredParams.length; i++) {
    if (!req.param(requiredParams[i], false)) {
      break;

      // Error!
    }
  }

  // Check for missing required params
  user.get(userId, function(err, body) {
    // Apply the updates to the object
    var _body = extend({}, body);
    for (var key in req.body) {
      _body[key] = req.body[key];
    }

    if (!_.isEqual(body, _body)) {
      console.log('we can insert');
      user.insert(_body, userId, function(err, body) {
        if (err) console.log(err);
        res.redirect('/user');
      });
    } else {
      res.redirect('/user');
    }

  });

  // If successful, send back
  // res.render('user/profile', { title: 'Your speaker profile', user: req.user, possibleAvatars: {} })
});

router.get('/list', utils.ensureAdmin, function(req, res) {
  res.send('{fuck:you}');
});

module.exports = router;
