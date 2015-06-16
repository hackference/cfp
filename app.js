/***
    Primary App file
    ----------------
    Author: Mike Elsmore <mike@elsmore.me> @ukmadlz
***/

'use strict';

// Config
var config = require('./config.js');

// Packages in use
var express       = require('express');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var cookieSession = require('cookie-session');
var passport      = require('passport');
var flash         = require('connect-flash');
var utils         = require('./lib/utils');

// Libs
var talkDb  = require(__dirname + '/lib/talk')(config.eventDB);

// routes
var routes = require('./routes/index');
var users  = require('./routes/users');
var talks  = require('./routes/talks');
var auth   = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.session.secret));
app.use(cookieSession({secret: config.session.secret}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

//
// A bit of middleware
//

// Check is user is logged in
app.use(function(req, res, next) {
  req.loggedIn = req.isAuthenticated() || false;
  next();
});

// Load in any CFP settings
app.use(function(req, res, next) {
  talkDb.get('settings', function(err, body) {
    delete body._id;
    delete body._rev;
    delete body.type;
    req.cfpSettings = body || {};
    next();
  });
});

// Check the user is valid, if not…force relogin
app.use(function(req, res, next) {
  if (req.user) {
    if (!req.user.id) {
      res.redirect('/logout');
    } else {
      next();
    }
  } else {
    next();
  }
});

// Make the drop nav useful
app.use(function(req, res, next) {

  req.dropnav = [];

  var userId = req.user.id;

  // Access Scoreboard
  if ((req.cfpSettings.voters.indexOf(userId) >= 0 && new Date(req.cfpSettings.votingDate) >= new Date())
  || req.cfpSettings.admins.indexOf(userId) >= 0) {
    req.dropnav.push({
      name: 'Scoreboard',
      path: '/talk/scoreboard'
    });
    req.dropnav.push({
      name: 'User List',
      path: '/user/list'
    });
  }

  next();
});

// Apply items used in all views
app.use(function(req, res, next) {
  var _render = res.render;
  res.render = function(view, options, fn) {
    if (!options) var options = {};
    options.user = req.user;
    options.loggedIn = req.loggedIn;
    options.dropnav = req.dropnav;

    // If flash messages thrown
    options.generalMessages = (req.flash('general')) ? req.flash('general') : [];

    options.offline = false;
    if (app.get('env') === 'development') {
      options.offline = true;
    }

    _render.call(this, view, options, fn);
  }

  next();
});

// Implement routes
app.use('/', routes);
app.use('/auth', auth);
app.use('/user', utils.ensureAuthenticated, users);
app.use('/talk', utils.ensureAuthenticated, talks);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
