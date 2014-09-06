/**
 * @fileOverview Read OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var crude = require('../..');

var testCase = require('crude-test-case');
testCase.setCrude(crude);
var Web = testCase.Web;

var testerLocal = require('../lib/tester.lib');

describe('Read OPs', function() {
  this.timeout(5000);

  beforeEach(function (done) {
    testCase.expressApp.init()
      .then(done, done);
  });

  beforeEach(function() {
    var web = new Web();
    this.req = web.req;
  });

  beforeEach(function () {
    // Setup crude
    this.ctrl = testerLocal.controller();
    this.crude = crude('/mock', this.ctrl, testCase.expressApp.app);
  });

  describe.only('Read records', function () {
    beforeEach(function(done) {
      var self = this;
      this.req.get('/mock')
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

    it('Should have proper type and length', function() {
      expect(this.body).to.be.an('array');
      expect(this.body).to.have.length(1);
    });
    it('Should have proper keys', function () {
      expect(this.body[0]).to.have.keys([
        'a',
      ]);
    });
    it('Should have proper values', function () {
      expect(this.body[0].a).to.equal(1);
    });
    it('Should invoke ctrl readLimit', function () {
      expect(this.ctrl.readLimit).to.have.been.calledOnce;
    });
    it('Should invoke ctrl readLimit with expected args', function () {
      expect(this.ctrl.readLimit).to.have.been.calledWith();
    });
  });

  describe('Read a single record', function () {
    it('should read a single record', function (done) {
      this.req.get('/user/' + this.udo._id)
        .expect(200)
        .expect('Content-type', /application\/json/, done);
    });
    it('should return a 404 if record not found', function (done) {
      this.req.get('/user/bogus')
        .expect(404)
        .expect('Content-type', /application\/json/, done);
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
