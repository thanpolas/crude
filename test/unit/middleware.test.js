/**
 * @fileOverview Middleware tests.
 */
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');

var tester = require('../lib/tester.lib');

var crude = require('../../');

describe('Middleware tests', function () {
  beforeEach(function () {
    this.ctrl = tester.controller();
    this.crude = crude('/middleware', this.ctrl);
    this.reqres = tester.reqres();
    this.stub = sinon.stub();
    this.stubTwo = sinon.stub();
    this.stubThree = sinon.stub();
  });

  function runMiddleware(op) {
    op.forEach(function (midd) {
      midd(this.reqres.req, this.reqres.res);
    }, this);
  }

  function runAssert () {
    expect(this.stub).to.have.been.calledOnce;
    expect(this.stub).to.have.been.calledWith(this.reqres.req, this.reqres.res);
    expect(this.stub).to.have.been.calledBefore(this.stubTwo);
    expect(this.stubTwo).to.have.been.calledBefore(this.stubThree);
  }

  function createTests (isSingle, operation) {
    it('should add middleware for ' + operation + ' OP, single: ' + isSingle, function (done) {
      if (isSingle) {
        this.crude[operation].use(this.stub);
        this.crude[operation].use(this.stubTwo);
        this.crude[operation].use(this.stubThree);
      } else {
        this.crude.use(this.stub);
        this.crude.use(this.stubTwo);
        this.crude.use(this.stubThree);
      }
      runMiddleware.call(this, this.crude[operation]);
      runAssert.call(this);
      done();
    });
  }

  describe('Per CRUD OP', function () {
    // create tests
    [
      'create',
      'readList',
      'readOne',
      'update',
      'delete',
    ].forEach(createTests.bind(null, true));
  });
  describe('CRUD wide middleware', function () {
    // create tests
    [
      'create',
      'readList',
      'readOne',
      'update',
      'delete',
    ].forEach(createTests.bind(null, false));
  });
});
