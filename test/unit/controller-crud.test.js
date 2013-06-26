/**
 * @fileOverview Testing the model validators.
 */

// var sinon  = require('sinon');
var chai = require('chai');
var assert = chai.assert;

// module to test
var CtrlCrud = require('../../controller-crud');

// var noop = function(){};

suite('10. Controller CRUD', function() {

  setup(function() {});
  teardown(function() {});


  // The numbering (e.g. 1.1.1) has nothing to do with order
  // The purpose is to provide a unique string so specific tests are
  // run by using the mocha --grep "1.1.1" option.

  suite('10.1 Helper funcs', function() {
    var ctrlCrud;
    setup(function() {
      ctrlCrud = new CtrlCrud();
    });

    test('10.1.1 process', function() {
      var mixedParams = {
        one: 1,
        two: 2,
        _three: 3,
        four: 4,
        _five: 5,
        _six: 6
      };

      var cleanedParams = {
        one: 1,
        two: 2,
        four: 4,
      };

      var result = ctrlCrud.process(mixedParams);
      assert.deepEqual(cleanedParams, result, 'process() result should match expected');
    });
  });
});
