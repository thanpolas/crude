/**
 * @fileOverview DELETE OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var Web = require('../../lib/web.lib');

var destroy = module.exports = {};

destroy.test = function(params) {
  describe('Delete OPs', function() {
    this.timeout(5000);

    beforeEach(function() {
      var web = new Web();
      this.req = web.req;
    });

    // create a record
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
