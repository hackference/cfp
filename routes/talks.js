var config  = require(__dirname + '/../config');
var express = require('express');
var talkDb  = require(__dirname + '/../lib/talk')(config.eventDB);
var utils   = require(__dirname + '/../lib/utils');
var router  = express.Router();
var _       = require('lodash');

// Talk Types
var talkTypes = [
  {
    value: 'talk',
    name: 'Conference Talk (40 Minutes)'
  },
  {
    value: 'lightning',
    name: 'Lightning Talk (10 Minutes)'
  },
  {
    value: 'workshop',
    name: 'Workshop (1.5 Hours)'
  }
]

var updateTalk = function(req, res) {
  // Talk ID
  var talkId = req.param('id', false);

  // The talks core info
  var talk = {
    title: req.param('title'),
    abstract: req.param('abstract'),
    type: req.param('type'),
    extra: req.param('extra')
  }

  // User Info
  var user = req.user;
  delete user.auth;

  // The doc doc doc
  var doc = {
    type: 'talk',
    talk: talk,
    user: user
  }

  // If no talk ID, treat as a new talk
  if (talkId) {
    talkDb.get(talkId, function(err, body) {
      if (!err) {

        // Only allow the creator to edit
        if (body.user.id == req.user.id) {

          // If different execute update
          if (_.isEqual(body.talk, talk) ||
          _.isEqual(body.user, user)) {

            body.talk = talk;
            body.user = user;

            talkDb.insert(body, talkId, function(err, body) {
              if (!err) {
                req.flash('general', 'Thank you for submitting a talk.');
                res.redirect('/talk/' + body.id);
              } else {
                console.log(err);
                res.render('talk/form', { talkTypes: talkTypes, talk: talk });
              }
            });
          } else {
            req.flash('general', 'Thank you for submitting a talk.');
            res.redirect('/talk/' + body.id);
          }
        } else {
          req.flash('general', 'Thank you for submitting a talk.');
          res.redirect('/talk/' + body.id);
        }
      } else {
        res.render('talk/form', { talkTypes: talkTypes, talk: talk });
      }
    });
  } else {
    talkDb.insert(doc, function(err, body) {
      if (!err) {
        req.flash('general', 'Thank you for submitting a talk.');
        res.redirect('/talk/' + body.id);
      } else {
        res.render('talk/form', { talkTypes: talkTypes, talk: talk });
      }
    });
  }

}

/* GET talk new */
router.get('/new', function(req, res) {
  // Stop submissions after X date
  if (new Date(req.cfpSettings.submissionDate) < new Date()) {
    req.flash('general', 'Sorry, but submissions to the Call for Papers is now closed.');
    res.redirect('/talk');
  }

  // Only allow
  if (!utils.userProfileComplete(req.user)) {
    req.flash('general', 'Please complete your profile to submit a talk');
    res.redirect('/user');
  } else {
    res.render('talk/form', { title: 'New Talk', talkTypes: talkTypes, talk: {} });
  }

});

/* POST submit new talk */
router.post('/new', updateTalk);

/* GET talk edit */
router.get('/:id/edit', function(req, res) {

  // Stop submissions after X date
  if (new Date(req.cfpSettings.submissionDate) < new Date()) {
    req.flash('general', 'Sorry, but submissions to the Call for Papers is now closed.');
    res.redirect('/talk');
  }

  // The Talk ID
  var talkId = req.param('id');

  talkDb.get(talkId, function(err, body) {

    // Non-found
    if (err) {
      res.render('talk/no-profile');
    } else {

      // If it's not a talk
      if (body.type != 'talk') {
        req.flash('general', 'This is not your talk.');
        res.redirect('/talk');
      } else {

        // Display the event data
        res.render('talk/form', { title: body.title, talkTypes: talkTypes, talk: body.talk });
      }
    }
  });
});

/* POST talk edit */
router.post('/:id/edit', updateTalk);

/* GET talk */
router.get('/:id', function(req, res) {

  // The Talk ID
  var talkId = req.param('id');

  // Force vote to false
  var vote = false;

  // Get the talk doc
  talkDb.get(talkId, function(err, body) {

    // Non-found
    if (err) {
      res.render('talk/no-profile');
    } else {

      // If it's not a talk
      if (body.type != 'talk') {
        res.redirect('/talk');
      } else {
        // Provide default
        if (!body.vote) {
          body.vote = [];
        }

        // Which page to Display
        var displayPage = 'talk/profile';
        if (req.cfpSettings.admins.indexOf(req.user.id) >= 0) {
          vote = body.vote;
          displayPage += '-admin';
        }
        else if (req.cfpSettings.voters.indexOf(req.user.id) >= 0) {
          vote = (body.vote.indexOf(req.user.id) >= 0) ? true : false;
          displayPage += '-voter';

        }

        // Display the event data
        res.render(displayPage, { title: body.talk.title, talk: body, vote: vote });
      }
    }
  });
});

/* GET talk vote */
router.get('/:id/vote', function(req, res) {

  // The Talk ID
  var talkId = req.param('id');

  // Only a voter may vote
  if (req.cfpSettings.voters.indexOf(req.user.id) >= 0) {

    var userId = req.user.id;

    talkDb.get(talkId, function(err, body) {
      // The creator cannot vote on his own talk
      if (body.user.id != userId) {
        if (!body.vote) {
          body.vote = [];
        }

        // Add users vote, unless user has cast vote then remove
        if (body.vote.indexOf(userId) < 0) {
          body.vote.push(userId);
        } else {
          body.vote.splice(body.vote.indexOf(userId));
        }

        // View options
        var options = {
          key: [userId, body.talk.type]
        };
        // Grab the talks
        talkDb.view('votes', 'byuser', options, function(err, votedata) {

          console.log(votedata.rows[0].value);

          if (!err) {
            console.log(body.talk.type);
            if (votedata.rows[0].value.count >= req.cfpSettings.voteSplit[body.talk.type]) {
              req.flash('general', 'You have given maximum votes for this talk type.');
            } else {
              // Update vote
              talkDb.insert(body, talkId, function(err, body) {
                if (!err) {
                  req.flash('general', 'Thank you for your vote.');
                } else {
                  console.log(err);
                  req.flash('general', 'A problem occured whilst adding your vote, please try again.');
                }
              });
            }
          } else {
            console.log(err);
            req.flash('general', 'A problem occured whilst adding your vote, please try again.');
          }

        });
      } else {
        req.flash('general', 'You can\'t vote on this talk.');
      }
    });

  } else {
    req.flash('general', 'You can\'t vote on this talk.');
  }

  res.redirect('/talk/' + talkId);
});

/* GET talks listing. */
router.get('/', function(req, res) {

  // The page title
  var title = 'Review talks';

  // make the userId easier to handle
  var userId = req.user.id;

  // View options
  var options = {
    include_docs: true
  };

  if (utils.viewAllSubmissions(userId, req.cfpSettings)) {
    options.key = userId;
    title += ' you have submitted';
  }

  // Grab the talks
  talkDb.view('user', 'byid', options, function(err, data) {

    // Swap out the value for an easier to read name
    for (i = 0; i < data.rows.length; i++) {
      for (j = 0; j < talkTypes.length; j++) {
        if (talkTypes[j].value == data.rows[i].doc.talk.type) {
          data.rows[i].doc.talk.type = talkTypes[j].name;
        }
      }
    }

    if (!utils.viewAllSubmissions(userId, req.cfpSettings)) {
      data.rows = utils.arrayShuffle(data.rows);
    }

    res.render('talk/index', { title: title, submissions: data.rows });

  });
});

module.exports = router;
