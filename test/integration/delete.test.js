/**
 * @fileOverview DELETE OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var setupUsers = require('../lib/fixture-user.lib');

describe('Delete OPs', function() {
  this.timeout(5000);

  setupUsers.createUser();

  describe('Delete record', function () {
    beforeEach(function(done) {
      var self = this;
      this.req.del('/user/' + this.udo.id)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.error('ERROR. Body:', res.body);
            done(err);
            return;
          }

          self.body = res.body;
          done();
        });
    });
    it('Should have removed the user', function (done) {
      this.userEnt.readOne(this.udo.id)
        .then(function(res) {
          expect(res).to.be.null;
          done();
        })
        .catch(done);
    });
  });
});
