/**
 * @fileOverview Test the exposed Test helpers API.
 */

var tester = require('../lib/tester.lib');

var TestCrud = require('../export/generic-crud-test.lib');
var userFix = require('../fixtures/user.fix');

tester.init();

var testCrud = new TestCrud({
  endpoint: '/user',
  fixture: userFix.one,
  stringAttr: 'firstName',
});

testCrud.run();

