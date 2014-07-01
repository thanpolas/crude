/**
 * @fileOverview Generic tester library for CRUD ops; this module is exposed
 *   as crude.Test
 */
var __ = require('lodash');
var Mocha = require('mocha');
var Promise = require('bluebird');

var createTest = require('./CRUD/create.test');
var readTest = require('./CRUD/read.test');
var updateTest = require('./CRUD/update.test');
var deleteTest = require('./CRUD/delete.test');

var noopCb = function(res, cb) {cb(null);};

/**
 * Generic CRUD Test module
 *
 *
 * @param {Object=} optParams Parameters to configure the tester:
 *    @param {string} endpoint the endpoint to test.
 *    @param {Object} fixture the data fixture to use.
 *    @param {string} stringAttr A string attribute in the fixture to use
 *           for updating and query filtering.
 *    @param {string} uniqueAttr An attribute that acts as a unique identifier
 *           of the record, e.g. the email if the model is a user, in an empty
 *           db this can be any field, not neccessarily an actually unique one.
 *    @param {Entity} Entity The entity instance of the model to be tested.
 *    @param {Object} create Create OP related parameters:
 *          @param {Function} response A node.js style callback with the tests res.
 *    @param {Object} readList Read List OP related parameters:
 *          @param {Function} response A node.js style callback with the tests res.
 *    @param {Object} readItem Read Item OP related parameters:
 *          @param {Function} response A node.js style callback with the tests res.
 *    @param {Object} readFilter Read Filter OP related parameters:
 *          @param {Function} response A node.js style callback with the tests res.
 *    @param {Object} update Update OP related parameters:
 *          @param {Function} response A node.js style callback with the tests res.
 *    @param {Object} delete Delete OP related parameters:
 *          @param {Function} response A node.js style callback with the tests res.
 * @constructor
 */
var Test = module.exports = function(optParams) {
  /** @type {boolean} If the tests have been setup */
  this.hasSetup = false;

  var params = optParams || {};

  if (!params.create) {params.create = {};}
  if (!params.readList) {params.readList = {};}
  if (!params.readItem) {params.readItem = {};}
  if (!params.readFilter) {params.readFilter = {};}
  if (!params.update) {params.update = {};}
  if (!params.delete) {params.delete = {};}

  /** @type {Object} The internal parameters object */
  this.params = {
    /** @type {?string} The API endpoint */
    endpoint: params.endpoint || null,

    /** @type {?Object} The Data Fixture to use */
    fixture: params.fixture || null,

    /** @type {?string} The attribute representing the db id */
    idAttr: params.idAttr || null,

    stringAttr: params.stringAttr || null,

    uniqueAttr: params.uniqueAttr || null,

    Entity: params.Entity || null,

    create: {
      response: params.create.response || noopCb,
    },
    readList: {
      response: params.readList.response || noopCb,
    },
    readItem: {
      response: params.readItem.response || noopCb,
    },
    readFilter: {
      response: params.readFilter.response || noopCb,
    },
    update: {
      response: params.update.response || noopCb,
    },
    delete: {
      response: params.delete.response || noopCb,
    },
  };
};

/**
 * Configure the tester.
 *
 * @param {Object} params The params dict as defined in the constructor.
 */
Test.prototype.configure = function(params) {
  __.extend(this.params, params);
};


/**
 * Setup the tests
 *
 */
Test.prototype.setup = function() {
  if(this.hasSetup) {
    return;
  }
  this.hasSetup = true;
  var self = this;
  describe('CRUD API Tester for endpoint: "' + this.params.endpoint + '"', function () {
    beforeEach(function () {
      this.entity = self.params.Entity.getInstance();
    });
    createTest.test(self.params);
    readTest.test(self.params);
    updateTest.test(self.params);
    deleteTest.test(self.params);
  });
};

/**
 * Run the tests
 *
 * @return {Promise} When tests are done.
 */
Test.prototype.run = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.setup();
    var mocha = new Mocha();

    mocha.run(function(failures) {
      if (failures) {
        reject('Total Errors found:', failures);
      } else {
        resolve();
      }
    });
  });
};
