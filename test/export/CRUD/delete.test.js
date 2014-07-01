/**
 * @fileOverview DELETE OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var testHelper = require('../test-helpers.lib');

var destroy = module.exports = {};

destroy.test = function(params) {
  describe('Delete OPs', function() {
    this.timeout(5000);

    testHelper.setupReq();

    // create a record
    testHelper.createItem(params);

    afterEach(function (done) {
      this.req.get(params.endpoint + '/' + this.item[params.idAttr])
        .expect(404, done);
    });

    it('Should delete the record', function (done) {
      this.req.del(params.endpoint + '/' + this.item[params.idAttr])
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.error('ERROR. Body:', res.body);
            done(err);
            return;
          }

          params.delete.response(res, done);
        });
    });
  });
};
