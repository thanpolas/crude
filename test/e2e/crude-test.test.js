/**
 * @fileOverview Test the exposed Test helpers API.
 */
var chai = require('chai');
var expect = chai.expect;

var testlib = require('crude-test-case');
var CrudeTest = require('crude-test');

var crude = require('../..');
testlib.setCrude(crude);
var userFix = testlib.fixUser;

describe.skip('Test the exposed API Test Helper', function () {
  this.timeout(5000);

  it('should execute...', function (done) {
    testlib.tester.initActual().then(function () {
      var testCrud = new CrudeTest({
        endpoint: '/user',
        fixture: userFix.one,
        stringAttr: 'firstName',
        idAttr: '_id',
        uniqueAttr: 'email',
        Entity: testlib.UserEnt,
      });

      testCrud.run().then(done, done);

    });

  });
});
