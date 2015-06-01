var config   = require(__dirname + '/../config');

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/logout')
}

// Only admins can Review
exports.ensureAdmin = function(req, res, next) {
  if (req.isAuthenticated() &&
  req.cfpSettings.admins.indexOf(req.user.id) >= 0) {
    return next();
  }

  res.redirect('/logout')
}

// Simplify creating the DB name
exports.createDbName = function(dbname) {
  if (config.cloudant.dbprefix) {
    dbname = config.cloudant.dbprefix + dbname;
  }

  return dbname;
}

// Allow voters and admins access to all
exports.viewAllSubmissions = function(userId, cfpSettings) {
  if (cfpSettings.admins.indexOf(userId) < 0 &&
  cfpSettings.voters.indexOf(userId) < 0) {
    return true;
  }

  return false;
}

// Add a means to gather user avatars
exports.userImages = function(userObj) {
  // Avatar array
  var avatars = new Array();

  // GitHub avatar
  if (userObj.auth.github) {
    var githubAvatar = userObj.auth.github.avatar_url;
    if (userObj.auth.github &&
    avatars.indexOf(githubAvatar)) {
      avatars.push({
        source: 'github',
        url: githubAvatar
      });
    }
  }
  // Twitter avatar…via avatars.io
  var twitterAvatar = 'http://avatars.io/twitter/' + userObj.twitter;
  if (userObj.twitter &&
  avatars.indexOf(twitterAvatar)) {
    avatars.push({
      source: 'twitter',
      url: twitterAvatar
    });
  }

  // Gravatar
  var gravatarAvatar = 'http://avatars.io/email/' + userObj.email;
  if (avatars.indexOf(gravatarAvatar)) {
    avatars.push({
      source: 'gravatar',
      url: gravatarAvatar
    });
  }

  return avatars;
}

// Required user values
exports.userRequiredParams = [
  'name',
  'email',
  'position',
  'bio'
];

// Check if a user has everything needed
exports.userProfileComplete = function(user) {
  // Check all the required params have been submitted
  for (i = 0; i < this.userRequiredParams.length; i++) {
    if (!user[this.userRequiredParams[i]]) {
      return false;
      break;
    }
  }
  return true;
}
