var config   = require(__dirname + '/../config');
if (typeof config.cloudant == 'object') {
  var cloudant = require('cloudant')(config.cloudant);
} else {
  var cloudant = require('nano')(config.cloudant)
}

module.exports = cloudant;
