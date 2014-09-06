/**
 * @fileOverview UPDATE OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var testlib = require('crude-test-case');
testlib.setCrude(require('../../'));

var setupUsers = testlib.libUser;
var tester = testlib.tester;

describe('Update OPs', function() {
  this.timeout(5000);

  setupUsers.createUser();

  describe('Update records', function () {
    beforeEach(function(done) {
      var self = this;
      this.req.post('/user/' + this.udo.id)
        .send({
          firstName: 'newFirst',
          lastName: 'newLast',
        })
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
    it('Should have proper keys', function () {
      expect(this.body).to.have.keys([
        '_id',
        'birthdate',
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
      expect(this.body.firstName).to.equal('newFirst');
      expect(this.body.lastName).to.equal('newLast');
      expect(this.body.companyName).to.equal('');
      expect(this.body.email).to.equal('pleasant@hq.com');
      expect(this.body.password).to.equal('123456');
      expect(this.body.createdOn).to.match(tester.reIso8601);
      expect(this.body.isVerified).to.equal(true);
      expect(this.body.isDisabled).to.equal(false);
      expect(this.body.isAdmin).to.equal(false);
    });
  });
});
