/**
 * @fileOverview Error & Success handlers tests
 */
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');

var tester = require('../lib/tester.lib');

var crude = require('../../');

describe('Error and Success Handlers', function () {
  beforeEach(function () {
    this.ctrl = tester.controller();
    this.crude = crude('/test', this.ctrl);
    this.reqres = tester.reqres();
  });

  describe('Error Handler', function () {
    beforeEach(function () {
      this.err = new Error('yum');
      this.ctrl.readLimit.throws(this.err);
    });

    it('should call the built-in error handler', function () {
      var handleStub = sinon.stub(this.crude.opts, 'onError');
      return this.crude.readList(this.reqres.req, this.reqres.res)
        .bind(this)
        .then(function() {
          expect(handleStub).to.have.been.calledOnce;
          expect(handleStub.args[0][0]).to.equal(this.reqres.req);
          expect(handleStub.args[0][1]).to.equal(this.reqres.res);
          expect(handleStub.args[0][2]).to.equal('paginate');
          expect(handleStub.args[0][3]).to.equal(500);
          expect(handleStub.args[0][4]).to.equal(this.err);
          handleStub.restore();
        });
    });

    it('should call the custom error handler', function (done) {
      this.spy = sinon.mock();
      this.crude.onError(this.spy);
      return this.crude.readList(this.reqres.req, this.reqres.res)
        .bind(this)
        .then(function() {
          expect(this.spy).to.have.been.calledOnce;
          expect(this.spy).to.have.been.calledWith(this.reqres.req, this.reqres.res,
            'paginate', 500, this.err);
        }).then(done, done);
    });
  });
});
