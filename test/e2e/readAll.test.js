/**
 * @fileOverview Read All OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var crude = require('../..');

var testCase = require('crude-test-case');
testCase.setCrude(crude);
var Web = testCase.Web;

var testerLocal = require('../lib/tester.lib');

describe('Read All OP', function() {
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
    this.crude.config({pagination: false});
  });

  describe('Standard Read All', function () {
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
    it('Should invoke ctrl read', function () {
      expect(this.ctrl.read).to.have.been.calledOnce;
    });
    it('Should invoke ctrl read with expected args', function () {
      expect(this.ctrl.read).to.have.been.calledWith({});
    });
  });

  describe('Read filtered records', function () {
    beforeEach(function(done) {
      var self = this;
      this.req.get('/mock')
        .query({
          b: 2,
          from: '1182850582748',
          to: '1182850582749',
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

    it('Should invoke read with proper arguments', function() {
      expect(this.ctrl.read).to.have.been.calledWith(
        {b: '2', createdAt: {between: ['1182850582748', '1182850582749']}});
    });
  });
});
