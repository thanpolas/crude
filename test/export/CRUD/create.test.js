/**
 * @fileOverview Create OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var testHelper = require('../test-helpers.lib');

var create = module.exports = {};

create.test = function(params) {
  describe('Create OPs', function() {
    this.timeout(5000);

    testHelper.setupReq();

    // before delete record
    testHelper.deleteItem(params, true);

    // after delete record
    testHelper.deleteItem(params);

    it('should create a record', function (done) {
      var self = this;
      this.req.post(params.endpoint)
        .send(params.fixture)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.error('ERROR. Body:', res.body);
            done(err);
            return;
          }

          expect(res.type).to.equal('application/json');
          params.create.response(res, function(err) {
            self.item = res.body;
            done(err);
          });
        });
    });
  });
};
