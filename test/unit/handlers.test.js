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
      this.error = new Error('yum');
      this.ctrl.read.throws(this.error);
    });

    it('should call the built-in error handler', function () {
      var handleStub = sinon.stub(this.crude, 'handleError');
      this.crude.read(this.reqres.req, this.reqres.res);
      expect(handleStub).to.have.been.calledOnce;
      expect(handleStub).to.have.been.calledWith(this.reqres.req, this.reqres.res,
        'read', 500, this.error);
      handleStub.restore();
    });

    it('should call the custom error handler', function () {
      this.spy = sinon.spy();
      this.crude.onError(this.spy);
      this.crude.read(this.reqres.req, this.reqres.res);
      expect(this.spy).to.have.been.calledOnce;
      expect(this.spy).to.have.been.calledWith(this.reqres.req, this.reqres.res,
        'read', 500, this.error);
    });
  });
});
