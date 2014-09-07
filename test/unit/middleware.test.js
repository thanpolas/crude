/**
 * @fileOverview Middleware tests.
 */
var Promise = require('bluebird');
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
  });

  function runAssert () {
    expect(this.stub).to.have.been.calledOnce;
    expect(this.stub).to.have.been.calledWith(this.reqres.req, this.reqres.res);
  }

  function createTests (isSingle, operation) {
    it('should add middleware for ' + operation + ' OP, single: ' + isSingle, function (done) {
      if (isSingle) {
        this.crude[operation].use(this.stub);
      } else {
        this.crude.use(this.stub);
      }
      this.crude[operation](this.reqres.req, this.reqres.res)
        .bind(this)
        .then(runAssert)
        .then(done, done);
    });

    it('should accept a promise and be async. OP: ' + operation + ' single: ' + isSingle, function (done) {
      var defer = Promise.defer();
      var asyncOk = false;
      this.stub.returns(defer.promise);

      if (isSingle) {
        this.crude[operation].use(this.stub);
      } else {
        this.crude.use(this.stub);
      }
      this.crude[operation](this.reqres.req, this.reqres.res)
        .bind(this)
        .then(runAssert)
        .then(function () {
          expect(asyncOk).to.be.true;
        })
        .then(done, done);

      setTimeout(function () {
        asyncOk = true;
        defer.resolve();
      }, 30);
    });

    it('should not invoke CRUD OP if error thrown for OP: ' + operation + ' single:' + isSingle, function (done) {
      this.stub.throws(new Error());

      if (isSingle) {
        this.crude[operation].use(this.stub);
      } else {
        this.crude.use(this.stub);
      }

      var crudeOp = operation;
      if (operation === 'readList') {
        crudeOp = 'readLimit';
      }

      this.crude[operation](this.reqres.req, this.reqres.res)
        .bind(this)
        .catch(runAssert)
        .bind(this)
        .then(function () {
          expect(this.ctrl[crudeOp]).to.not.have.been.called;
        })
        .then(done, done);
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
