var config   = require(__dirname + '/../config');
var cloudant = require(__dirname + '/../lib/db');
var utils    = require(__dirname + '/../lib/utils');

module.exports = function(eventDbName) {

  // Form the userDB with prefix
  var eventDb = utils.createDbName(eventDbName);

  // Check the DB exists
  cloudant.db.get(eventDb, function(err, body) {
    if (err) {
      cloudant.db.create(eventDb);
    }
  });

  // Hand back the object
  return cloudant.use(eventDb);
}
