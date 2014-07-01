/**
 * @fileOverview Create OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var Web = require('../../lib/web.lib');

var create = module.exports = {};

create.test = function(params) {
  describe('Create OPs', function() {
    this.timeout(5000);

    beforeEach(function() {
      var web = new Web();
      this.req = web.req;
    });

    afterEach(function (done) {
      this.req.delete(params.endpoint + '/' + this.item[params.idAttr])
        .expect(200, done);
    });

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

          expect(res.type).to.equal('JSON');
          params.create.response(res, function(err) {
            self.item = res.body;
            done(err);
          });
        });
    });
  });
};
