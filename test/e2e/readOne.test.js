/**
 * @fileOverview Read One OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var crude = require('../..');

var testCase = require('crude-test-case');
testCase.setCrude(crude);
var Web = testCase.Web;

var testerLocal = require('../lib/tester.lib');

describe('Read One OP', function() {
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

  describe('Read a single record', function () {
    beforeEach(function(done) {
      var self = this;
      this.req.get('/mock/a_unique_id')
        .expect(200)
        .expect('Content-type', /application\/json/)
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
    it('Should invoke ctrl readOne', function () {
      expect(this.ctrl.readOne).to.have.been.calledOnce;
    });
    it('Should invoke ctrl readOne with expected args', function () {
      expect(this.ctrl.readOne).to.have.been.calledWith({id: 'a_unique_id'});
    });
  });
});
