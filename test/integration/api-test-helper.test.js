/**
 * @fileOverview Test the exposed Test helpers API.
 */

var UserEnt = require('../setup/user.ent');

var tester = require('../lib/tester.lib');

var TestCrud = require('../export/generic-crud-test.lib');
var userFix = require('../fixtures/user.fix');

describe('Test the exposed API Test Helper', function () {
  this.timeout(5000);
  it('should execute...', function (done) {
    tester.initActual().then(function () {
      var testCrud = new TestCrud({
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
