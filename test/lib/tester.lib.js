/**
 * @fileOverview Main testing helper lib, exporting fixtures, helper functions
 *   etc. All tests must require it.
 */
var app = require('../..');
var testdb = require('./test-db.lib');

var tester = module.exports = {};

tester.setup = null;
tester.teardown = null;

if (global.setup) {
  tester.setup = setup;
  tester.teardown = teardown;
} else {
  tester.setup = beforeEach;
  tester.teardown = afterEach;
}

// global setup
var init = false;

/**
 * Boot application.
 *
 */
tester.init = function() {
  tester.setup(function(done) {
    if (init) {return done();}
    init = true;

    testdb.stub();

    app.init({
      nolog: false,
      stubMail: true,
      nosecurity: true,
      noClipWatch: true,
    }).then(done.bind(null, null), done);
  });
};

/**
 * Have a Cooldown period between tests.
 *
 * @param {number} seconds cooldown in seconds.
 * @return {Function} use is beforeEach().
 */
tester.cooldown = function(seconds) {
  return function(done) {
    setTimeout(done, seconds);
  };
};

/** @type {RegExp} Test an ISO8601 type date */
tester.reIso8601 = /^(\d{4})(-(\d{2}))??(-(\d{2}))??(T(\d{2}):(\d{2})(:(\d{2}))??(\.(\d+))??(([+-]{1}\d{2}:\d{2})|Z)??)??$/;
