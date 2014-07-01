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
            console.error('ERROR. Body:', res.body);
            done(err);
            return;
          }

          self.body = res.body;
          done();
        });
    });
    it('Should have proper length', function() {
      expect(this.body).to.have.length(3);
    });
    it('Should have proper keys', function () {
      expect(this.body[0]).to.have.keys([
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

  describe.only('Read a single record', function () {
    it('should read a single record', function (done) {
      this.req.get('/user/' + this.udo._id)
        .expect(200)
        .expect('Content-type', 'application/json; charset=utf-8', done);
    });
    it('should return a 404 if record not found', function (done) {
      this.req.get('/user/bogus')
        .expect(404)
        .expect('Content-type', 'application/json; charset=utf-8', done);
    });
  });

  describe('Read filtered records', function () {
    it('Email filter :: should have right results count', function(done) {
      this.req.get('/user')
        .query({email: 'pleasant@hq.com'})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.error('ERROR. Body:', res.body);
            done(err);
            return;
          }
          expect(res.body).to.have.length(1);
          done();
        });
    });
    it('Date filter :: should have right results count', function(done) {
      this.req.get('/user')
        .query({from: '1182850582748'})
        // .query({from: '2006-06-26T09:36:22.748Z'})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.error('ERROR. Body:', res.body);
            done(err);
            return;
          }
          expect(res.body).to.have.length(2);
          done();
        });
    });
    it('Date range filter :: should have right results count', function(done) {
      this.req.get('/user')
        .query({from: '1182850582748'})
        .query({to: '1246008982748'})
        // .query({from: '2006-06-26T09:36:22.748Z'})
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.error('ERROR. Body:', res.body);
            done(err);
            return;
          }
          expect(res.body).to.have.length(1);
          done();
        });
    });

  });
});
