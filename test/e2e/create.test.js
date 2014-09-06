/**
 * @fileOverview Create OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var crude = require('../../');

var testCase = require('crude-test-case');
testCase.setCrude(crude);

var testerLocal = require('../lib/tester.lib');

var Web = testCase.Web;
var userFix = testCase.fixUser;

describe.only('Create OPs', function() {
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

  describe('Create a record', function () {
    beforeEach(function(done) {
      var self = this;
      this.req.post('/mock')
        .send(userFix.one)
        .expect(201)
        .end(function(err, res) {
          if (err) {
            console.error('ERROR. Body:', err, (res && res.body));
            done(err);
            return;
          }
          self.body = res.body;
          done();
        });
    });
    it('Should have proper keys', function () {
      expect(this.body).to.have.keys([
        'a',
      ]);
    });
    it('Should have proper values', function () {
      expect(this.body.a).to.equal(1);
    });
    it('should invoke controller.create', function() {
      expect(this.ctrl.create).to.have.been.calledOnce;
    });
    it('Should invoke controller.create() with proper params', function () {
      expect(this.ctrl.create).to.have.been.calledWith(userFix.one);
    });
  });
});
