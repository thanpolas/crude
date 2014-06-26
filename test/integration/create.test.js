/**
 * @fileOverview Create OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var tester = require('../lib/tester.lib');
var Web = require('../lib/web.lib');
var userFix = require('../fixtures/user.fix');
var db = require('../lib/db.lib');

describe('Create OPs', function() {
  this.timeout(5000);

  tester.init();

  beforeEach(function(done) {
    var web = new Web();
    this.req = web.req;

    db.nuke().then(done, done);
  });

  describe('Create a record', function () {
    beforeEach(function(done) {
      var self = this;
      this.req.post('/user')
        .send(userFix.one)
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
      expect(this.body.firstName).to.equal('John');
      expect(this.body.lastName).to.equal('Doe');
      expect(this.body.companyName).to.equal('');
      expect(this.body.email).to.equal('pleasant@hq.com');
      expect(this.body.password).to.equal('123456');
      expect(this.body.createdOn).to.match(tester.reIso8601);
      expect(this.body.isVerified).to.equal(false);
      expect(this.body.isDisabled).to.equal(false);
      expect(this.body.isAdmin).to.equal(false);
    });
  });
});
