/**
 * @fileOverview Common API testing library.
 */
var req = require('supertest');

/**
 * Provides connectivity and network helpers.
 *
 * @constructor
 */
module.exports = function() {
  var app = 'http://localhost:3100';
  // expose the supertest request object with the webserver's url predefined.
  this.req = req(app);
  this.hasAuthorized = false;
  this.udo = null;
};
