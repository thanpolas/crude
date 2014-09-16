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
    this.query = {a: 1};
    this.stub = sinon.stub();
    this.stubTwo = sinon.stub();
    this.stubThree = sinon.stub();
  });

  describe('Express type middleware', function () {
    function runMiddleware(op) {
      op.forEach(function (midd) {
        midd(this.reqres.req, this.reqres.res);
      }, this);
    }

    function runAssert () {
      expect(this.stub).to.have.been.calledOnce;
      expect(this.stubTwo).to.have.been.calledOnce;
      expect(this.stubThree).to.have.been.calledOnce;
      expect(this.stub).to.have.been.calledWith(this.reqres.req, this.reqres.res);
      expect(this.stubTwo).to.have.been.calledWith(this.reqres.req, this.reqres.res);
      expect(this.stubThree).to.have.been.calledWith(this.reqres.req, this.reqres.res);
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

  describe('Query type middleware', function () {
    function runAsserts () {
      it('should call stub One once', function () {
        expect(this.stub).to.have.been.calledOnce;
      });
      it('should call stub Two once', function () {
        expect(this.stubTwo).to.have.been.calledOnce;
      });
      it('should call stub Three once', function () {
        expect(this.stubThree).to.have.been.calledOnce;
      });
      it('should call stub One with expected arguments', function () {
        expect(this.stub).to.have.been.calledWith(this.query);
      });
      it('should call stub Two with expected arguments', function () {
        expect(this.stubTwo).to.have.been.calledWith(this.query);
      });
      it('should call stub Three with expected arguments', function () {
        expect(this.stubThree).to.have.been.calledWith(this.query);
      });
      it('should call stub One before stub Two', function () {
        expect(this.stub).to.have.been.calledBefore(this.stubTwo);
      });
      it('should call stub Two before stub Three', function () {
        expect(this.stubTwo).to.have.been.calledBefore(this.stubThree);
      });
    }

    function createTests (isSingle, operation) {
      beforeEach(function () {
        this.stub = sinon.stub();
        this.stubTwo = sinon.stub();
        this.stubThree = sinon.stub();

        if (isSingle) {
          this.crude[operation].use(this.stub);
          this.crude[operation].use(this.stubTwo);
          this.crude[operation].use(this.stubThree);
        } else {
          this.crude.useQuery(this.stub);
          this.crude.useQuery(this.stubTwo);
          this.crude.useQuery(this.stubThree);
        }

        // invoke and test
        return this.crude[operation](this.query);
      });

      describe('Testing Operation: ' + operation + ', Is Single:' + isSingle, function () {
        runAsserts();
      });
    }

    describe('Per CRUD OP', function () {
      // create tests
      [
        'readListQuery',
        'readOneQuery',
        'updateQuery',
        'deleteQuery',
      ].forEach(createTests.bind(null, true));
    });
    describe('CRUD wide middleware', function () {
      // create tests
      [
        'readListQuery',
        'readOneQuery',
        'updateQuery',
        'deleteQuery',
      ].forEach(createTests.bind(null, false));
    });
  });
});
