var config   = require(__dirname + '/../config');
var cloudant = require(__dirname + '/../lib/db');
var utils    = require(__dirname + '/../lib/utils');

// Form the userDB with prefix
var userDb = utils.createDbName('user');

// Check the DB exists
cloudant.db.get(userDb, function(err, body) {
  if (err) {
    cloudant.db.create(userDb, function(err, body) {
      var designDoc = require(__dirname + '/../designdocs/user.js');
      cloudant.use(userDb).insert(designDoc.doc, '_design/user');
    });
  }
});

module.exports = cloudant.use(userDb);
