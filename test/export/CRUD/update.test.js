/**
 * @fileOverview UPDATE OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var Web = require('../../lib/web.lib');

var update = module.exports = {};

update.test = function(params) {
  describe('Update OPs', function() {
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

    // delete the record
    afterEach(function (done) {
      this.req.delete(params.endpoint + '/' + this.item[params.idAttr])
        .expect(200, done);
    });

    it('Should Update records', function (done) {
      var updateObj = {};
      updateObj[params.stringAttr] = 'new value';

      this.req.post(params.endpoint + '/' + this.item[params.idAttr])
        .send(updateObj)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.error('ERROR. Body:', res.body);
            done(err);
            return;
          }

          expect(res.body[params.stringAttr]).to.equal('new value');
          params.update.response(res, done);
        });
    });
  });
};
