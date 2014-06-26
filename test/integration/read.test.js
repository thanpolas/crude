/**
 * @fileOverview Read OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var tester = require('../lib/tester.lib');
var setupUsers = require('../lib/fixture-user.lib');

describe('Read OPs', function() {
  this.timeout(5000);

  setupUsers.createUser();

  describe('Read records', function () {
    beforeEach(function(done) {
      var self = this;
      this.req.get('/user')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.log('ERROR. Body:', res.body);
            done(err);
            return;
          }

          self.body = res.body;
          done();
        });
    });
    it('Should have proper length', function() {
      expect(this.body).to.have.length(2);
    });
    it('Should have proper keys', function () {
      expect(this.body[0]).to.have.keys([
        'firstName',
        'lastName',
        'companyName',
        'email',
        'password',
        'createdOn',
        'isVerified',
        'isDisabled',
        'isAdmin',
      ]);
    });
    it('Should have proper values', function () {
      expect(this.body[0].firstName).to.equal('John');
      expect(this.body[0].lastName).to.equal('Doe');
      expect(this.body[0].companyName).to.equal('');
      expect(this.body[0].email).to.equal('pleasant@hq.com');
      expect(this.body[0].password).to.equal('123456');
      expect(this.body[0].createdOn).to.match(tester.reIso8601);
      expect(this.body[0].isVerified).to.equal(true);
      expect(this.body[0].isDisabled).to.equal(false);
      expect(this.body[0].isAdmin).to.equal(false);
    });
  });
});
