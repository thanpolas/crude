/**
 * @fileOverview Database test helper.
 */
var Promise = require('bluebird');

var userModel = require('../setup/user.mongoose.model').getInstance();


var db = module.exports = {};

/**
 * Clean the db of all records
 *
 * @return {Promise} A promise.
 */
db.nuke = function() {
  return new Promise(function(resolve, reject) {
    userModel.Model.remove({}, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};
