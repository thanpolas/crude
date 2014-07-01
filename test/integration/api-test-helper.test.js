/**
 * @fileOverview Test the exposed Test helpers API.
 */
var chai = require('chai');
var expect = chai.expect;

var UserEnt = require('../setup/user.ent');

var tester = require('../lib/tester.lib');

var crude = require('../..');
var userFix = require('../fixtures/user.fix');

describe('Test the exposed API Test Helper', function () {
  this.timeout(5000);
  it('should expose the tester', function() {
    expect(crude.Test).to.be.a('function');
  });

  it('should execute...', function (done) {
    tester.initActual().then(function () {
      var testCrud = new crude.Test({
        endpoint: '/user',
        fixture: userFix.one,
        stringAttr: 'firstName',
        idAttr: '_id',
        uniqueAttr: 'email',
        entity: UserEnt.getInstance(),
      });

      testCrud.run().then(done, done);

    });

  });
});
