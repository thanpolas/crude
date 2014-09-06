/**
 * @fileOverview DELETE OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var crude = require('../..');

var testCase = require('crude-test-case');
testCase.setCrude(crude);
var Web = testCase.Web;

var testerLocal = require('../lib/tester.lib');

describe('Delete OPs', function() {
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


  describe('Delete record', function () {
    beforeEach(function(done) {
      var self = this;
      this.req.del('/mock/a_unique_id')
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
        'a',
      ]);
    });
    it('Should have proper values', function () {
      expect(this.body.a).to.equal(1);
    });
    it('Should invoke ctrl delete', function () {
      expect(this.ctrl.delete).to.have.been.calledOnce;
    });
    it('Should invoke ctrl delete with expected args', function () {
      expect(this.ctrl.delete).to.have.been.calledWith({id: 'a_unique_id'});
    });

  });
});
