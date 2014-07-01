/**
 * @fileOverview Test helpers to remain neat & DRY.
 */
var Web = require('../lib/web.lib');

var helpers = module.exports = {};

/**
 * Setup a new supertest request object.
 *
 */
helpers.setupReq = function () {
  beforeEach(function() {
    var web = new Web();
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
    this.req.post(params.endpoint)
      .send(params.fixture)
      .expect(200)
      .end(function(err, res) {
        if (err) {
          console.error('Create ERROR. Body:', res.body);
          done(err);
          return;
        }

        self.item = res.body;
        done();
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
    this.req.delete(params.endpoint + '/' + this.item[params.idAttr])
      .expect(200, done);
  }

  if (isBefore) {
    beforeEach(deleteHook);
  } else {
    afterEach(deleteHook);
  }
};
