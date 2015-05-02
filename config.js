/*
  Config all the things
 */

// Load .env if found
var fs = require('fs');
if (fs.existsSync('.env')) {
  require('dotenv').load();
}

//
// Session
//
exports.session        = {};
exports.session.secret = process.env.SESSION_SECRET || 'SHHHHITSASECRET';

//
// Event DB
//
exports.eventDB = process.env.EVENT_DB || '-- Event DB --';

//
// Database
//
if (process.env.COUCHDB_URL) {
  exports.cloudant = process.env.COUCHDB_URL;
} else {
  exports.cloudant          = {};
  exports.cloudant.account  = process.env.CLOUDANT_ACCOUNT || '{account}';

  // For most applications you will want to use API keys over the ROOT account details
  exports.cloudant.dbprefix = process.env.CLOUDANT_PREFIX || '';
  exports.cloudant.username = process.env.CLOUDANT_USERNAME || false;
  exports.cloudant.password = process.env.CLOUDANT_PASSWORD || '{password}';
}

//
// Passport
//

// GitHub
exports.github                 = {};
exports.github.client_id       = process.env.GITHUB_CLIENT_ID || '--insert-github-client-id-here--';
exports.github.client_secret   = process.env.GITHUB_CLIENT_SECRET || "--insert-github-client-secret-here--";
exports.github.client_callback = process.env.GITHUB_CLIENT_CALLBACK || "http://localhost:3000/auth/github/callback";

// Twitter
exports.twitter                   = {};
exports.twitter.consumer_key      = process.env.TWITTER_CONSUMER_KEY || '--insert-twitter-consumer-key-here--';
exports.twitter.consumer_secret   = process.env.TWITTER_CONSUMER_SECRET || "--insert-twitter-consumer-secret-here--";
exports.twitter.consumer_callback = process.env.TWITTER_CONSUMER_CALLBACK || "http://127.0.0.1:3000/auth/twitter/callback";

// Google
exports.google                   = {};
exports.google.consumer_key      = process.env.GOOGLE_CONSUMER_KEY || "--insert-google-consumer-key-here--"
exports.google.consumer_secret   = process.env.GOOGLE_CONSUMER_SECRET || "--insert-google-consumer-secret-here--";
exports.google.consumer_callback = process.env.GOOGLE_CONSUMER_CALLBACK || "http://127.0.0.1:3000/auth/google/callback";

// BitBucket
exports.bitbucket                   = {};
exports.bitbucket.consumer_key      = process.env.BITBUCKET_CONSUMER_KEY || "--insert-bitbucket-consumer-key-here--"
exports.bitbucket.consumer_secret   = process.env.BITBUCKET_CONSUMER_SECRET || "--insert-bitbucket-consumer-secret-here--";
exports.bitbucket.consumer_callback = process.env.BITBUCKET_CONSUMER_CALLBACK || "http://127.0.0.1:3000/auth/bitbucket/callback";
