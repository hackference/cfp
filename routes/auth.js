var express           = require('express');
var config            = require(__dirname + '/../config.js');
var router            = express.Router();
var passport          = require('passport');
var GitHubStrategy    = require('passport-github').Strategy;
var BitbucketStrategy = require('passport-bitbucket').Strategy;
var GoogleStrategy    = require('passport-google-oauth').OAuth2Strategy;
var user              = require(__dirname + '/../lib/user');

// Clean up the user object
function cleanUpUserObject(userdoc) {
  userdoc.id = userdoc._id;
  delete userdoc._id;
  delete userdoc._rev;
  return userdoc;
}

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(obj, done) {
  user.get(obj, function(err, body) {
    if (err) {
      var userdoc = {}
    } else {
      var userdoc = cleanUpUserObject(body);
    }

    return done(null, userdoc);
  });
});

// Use the GitHubStrategy within Passport.
passport.use(new GitHubStrategy({
    clientID: config.github.client_id,
    clientSecret: config.github.client_secret,
    callbackURL: config.github.client_callback
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {

      var options = {
        key: profile._json.email,
        include_docs: true
      };
      user.view('user', 'byemail', options, function(err, data) {
        if (err) return false;

        // Create user if doesn't exist
        if (!data.rows.length) {
          var doc = {
            name: profile._json.name,
            email: profile._json.email,
            avatar: profile._json.avatar_url,
            url: profile._json.blog,
            github: profile._json.login,
            company: profile._json.company,
            auth: {
              github : profile._json
            }
          }
          user.insert(doc, function(err, userdata) {
            user.get(userdata.id, function(err, body) {
              return done(null, cleanUpUserObject(body));
            });
          })
        } else {
          var userdoc = data.rows[0].doc;
          userdoc.id = userdoc._id;
          userdoc.github = userdoc.github || profile._json.login;
          userdoc.company = userdoc.company || profile._json.company;

          // Update the auth data
          if (!('auth' in userdoc)) userdoc.auth = {}
          if (!('github' in userdoc.auth)) userdoc.auth.github = {}
          userdoc.auth.github = profile._json
          user.insert(userdoc, userdoc._id)

          return done(null, cleanUpUserObject(userdoc));
        }

      });
    });
  }

));

// Use the GoogleStrategy within Passport.
passport.use(new GoogleStrategy({
    clientID: config.google.consumer_key,
    clientSecret: config.google.consumer_secret,
    callbackURL: config.google.consumer_callback
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {
      var email = profile.emails[0].value;
      var options = {
        key: email,
        include_docs: true
      };
      user.view('user', 'byemail', options, function(err, data) {
        if (err) return false;

        // Create user if doesn't exist
        if (!data.rows.length) {
          var doc = {
            name: profile.displayName,
            email: email,
            avatar: profile.photos[0].value,
            url: profile._json.url,
            auth: {
              google: profile._json
            }
          }
          user.insert(doc, function(err, userdata) {
            user.get(userdata.id, function(err, body) {
              return done(null, cleanUpUserObject(body));
            });
          })
        } else {
          console.log(data)
          var userdoc = data.rows[0].doc;
          userdoc.id = userdoc._id;

          // Update the auth data
          if (!('auth' in userdoc)) userdoc.auth = {}
          if (!('google' in userdoc.auth)) userdoc.auth.google = {}
          userdoc.auth.google = profile._json
          user.insert(userdoc, userdoc._id)

          return done(null, cleanUpUserObject(userdoc));
        }
      });
    });
  }

));

// Use the BitbucketStrategy within Passport.
passport.use(new BitbucketStrategy({
    consumerKey: config.bitbucket.consumer_key,
    consumerSecret: config.bitbucket.consumer_secret,
    callbackURL: config.bitbucket.consumer_callback
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {

      // To keep the example simple, the user's Bitbucket profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Bitbucket account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }

));

/* GET github oauth. */
router.get('/github', passport.authenticate('github'));

/* GET github oauth callback. */
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/logout' }),
  function(req, res) {
    res.redirect('/');
  });

/* GET Google oauth. */
router.get('/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'] }));

/* GET bitbucket oauth callback. */
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/logout' }),
  function(req, res) {
    res.redirect('/');
  });

// /* GET bitbucket oauth. */
// router.get('/bitbucket',passport.authenticate('bitbucket'));
//
// /* GET bitbucket oauth callback. */
// router.get('/bitbucket/callback',
//   passport.authenticate('bitbucket', { failureRedirect: '/logout' }),
//   function(req, res) {
//     res.redirect('/');
// });

module.exports = router;
