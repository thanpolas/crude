/**
 * @fileOverview Setup User Fixtures
 */
var Promise = require('bluebird');

var tester = require('./tester.lib');
var UserEnt = require('../setup/user.ent');
var Web = require('./web.lib');
var userfix = require('../fixtures/user.fix');
var db = require('./db.lib');

var fixtures = module.exports = {};

/**
 * Provide some fixtures.
 *
 * Will populate on the test context the following properties:
 *   - req (supertest)
 *   - udo
 *   - userEnt
 */
fixtures.createUser = function() {
  tester.init();

  tester.setup(function() {
    this.userEnt = UserEnt.getInstance();

    var web = new Web();
    this.req = web.req;
  });

  tester.setup(function(done) {
    db.nuke().then(done, done);
  });

  tester.setup(function(done) {
    var self = this;
    this.userEnt.create(userfix.oneFull)
      .then(function(userDataObject) {
        self.udo = userDataObject;
      }).then(done, done);
  });

  tester.setup(function(done) {
    var self = this;
    this.userEnt.create(userfix.two)
      .then(function(userDataObject) {
        self.udoTwo = userDataObject;
      }).then(done, done);
  });

  tester.setup(function(done) {
    var self = this;
    this.userEnt.create(userfix.three)
      .then(function(userDataObject) {
        self.udoThree = userDataObject;
      }).then(done, done);
  });

  tester.teardown(function(done) {
    db.nuke().then(done, done);
  });
};
