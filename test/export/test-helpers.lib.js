/**
 * @fileOverview Test helpers to remain neat & DRY.
 */
var Web = require('../lib/web.lib');

var helpers = module.exports = {};

/**
 * Setup a new supertest request object.
 *
 * @param {Object} params Config parameters.
 */
helpers.setupReq = function (params) {
  beforeEach(function() {
    var web = new Web(params.hostname);
    this.req = web.req;
  });
};

/**
 * Add beforeEach hook to create a record.
 *
 * @param {Object} params Config parameters.
 */
helpers.createItem = function(params) {
  helpers.deleteItem(params, true);

  beforeEach(function (done) {
    var self = this;
    this.entity.create(params.fixture)
      .then(function(item) {
        self.item = item;
        done();
      }).catch(function(err) {
        console.error('Create ERROR:', err);
        done(err);
      });
  });
};

/**
 * Add afterEach hook to delete a record.
 *
 * @param {Object} params Config parameters.
 * @param {boolean=} isBefore set to true to add to "beforeEach" hook.
 */
helpers.deleteItem = function(params, isBefore) {
  function deleteHook(done) {
    var queryObj = {};
    queryObj[params.uniqueAttr] = params.fixture[params.uniqueAttr];
    this.entity.delete(queryObj).then(done.bind(null, null), done);
  }

  if (isBefore) {
    beforeEach(deleteHook);
  } else {
    afterEach(deleteHook);
  }
};
