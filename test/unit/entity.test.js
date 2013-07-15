/**
 * @fileOverview Testing the model validators.
 */

// var sinon  = require('sinon');
var chai = require('chai');
var assert = chai.assert;

// module to test
var Entity = require('../../entity');

// var noop = function(){};

suite('2. Entity', function() {

  setup(function() {});
  teardown(function() {});


  // The numbering (e.g. 1.1.1) has nothing to do with order
  // The purpose is to provide a unique string so specific tests are
  // run by using the mocha --grep "1.1.1" option.

  suite('2.1 Test Interface', function() {
    var ent;
    setup(function() {
      ent = new Entity();
    });
    test('2.1.1 Primitive Methods', function(){
      assert.isFunction(ent.create, 'Entity should have a "create" method');
      assert.isFunction(ent.read, 'Entity should have a "read" method');
      assert.isFunction(ent.readOne, 'Entity should have a "readOne" method');
      assert.isFunction(ent.readLimit, 'Entity should have a "readLimit" method');
      assert.isFunction(ent.update, 'Entity should have a "update" method');
      assert.isFunction(ent.delete, 'Entity should have a "delete" method');
      assert.isFunction(ent.setUdo, 'Entity should have a "setUdo" method');
      assert.isFunction(ent.count, 'Entity should have a "count" method');
    });
  });
});
