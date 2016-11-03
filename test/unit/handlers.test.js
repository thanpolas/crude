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

  describe('Error Handlers', function () {
    beforeEach(function () {
      this.err = new Error('yum');
    });
    afterEach(function () {
    });

    describe('Built-in Error Handler', function () {
      beforeEach(function () {
        this.handleStub = sinon.stub(this.crude.opts, 'onError');
      });
      afterEach(function () {
        this.handleStub.restore();
      });

      function runAssert(operation) {
        return function () {
          expect(this.handleStub).to.have.been.calledOnce;
          expect(this.handleStub).to.have.been.calledWith(this.reqres.req,
            this.reqres.res, operation, 400, this.err);
        };
      }

      it('should work on pagination', function () {
        this.ctrl.readLimit.throws(this.err);
        return this.crude._readList(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('paginate'));

      });
      it('should work on read all', function () {
        this.ctrl.read.throws(this.err);
        this.crude.config({pagination: false});
        return this.crude._readList(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('read'));
      });
      it('should work on read one', function () {
        this.ctrl.readOne.throws(this.err);
        this.reqres.req.params.id = 'one';
        return this.crude._readOne(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('readOne'));
      });
      it('should work on update', function () {
        this.ctrl.update.throws(this.err);
        this.reqres.req.params.id = 'one';
        return this.crude._update(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('update'));
      });
      it('should work on delete', function () {
        this.ctrl.delete.throws(this.err);
        this.reqres.req.params.id = 'one';
        return this.crude._delete(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('delete'));
      });
      it('should work on create', function () {
        this.ctrl.create.throws(this.err);
        return this.crude._create(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('create'));
      });

    });

    describe('Custom Error Handler', function () {
      function runAssert (operation) {
        return function () {
          expect(this.spy).to.have.been.calledOnce;
          expect(this.spy).to.have.been.calledWith(this.reqres.req, this.reqres.res,
            operation, 400, this.err);
        };
      }
      beforeEach(function () {
        this.spy = sinon.spy();
        this.crude.onError(this.spy);
      });

      it('should work on pagination', function () {
        this.ctrl.readLimit.throws(this.err);
        return this.crude._readList(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('paginate'));

      });
      it('should work on read all', function () {
        this.ctrl.read.throws(this.err);
        this.crude.config({pagination: false});
        return this.crude._readList(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('read'));
      });
      it('should work on read one', function () {
        this.ctrl.readOne.throws(this.err);
        this.reqres.req.params.id = 'one';
        return this.crude._readOne(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('readOne'));
      });
      it('should work on update', function () {
        this.ctrl.update.throws(this.err);
        this.reqres.req.params.id = 'one';
        return this.crude._update(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('update'));
      });
      it('should work on delete', function () {
        this.ctrl.delete.throws(this.err);
        this.reqres.req.params.id = 'one';
        return this.crude._delete(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('delete'));
      });
      it('should work on create', function () {
        this.ctrl.create.throws(this.err);
        return this.crude._create(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('create'));
      });
    });
  });

  describe('Success Handlers', function () {
    function runAssert(operation, optHttpCode, optArr) {
      var httpCode = optHttpCode || 200;

      return function () {
        var result = this.ctrl.__item;
        if (optArr) {
          result = [this.ctrl.__item];
        }

        expect(this.handleStub).to.have.been.calledOnce;
        expect(this.handleStub).to.have.been.calledWith(this.reqres.req,
          this.reqres.res, operation, httpCode, result);
      };
    }

    describe('Built-in Success Handler', function () {
      beforeEach(function () {
        this.handleStub = sinon.stub(this.crude.opts, 'onSuccess');
        this.result = {};
      });
      afterEach(function () {
        this.handleStub.restore();
      });

      it('should work on pagination', function () {
        return this.crude._readList(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('paginate', null, true));

      });
      it('should work on read all', function () {
        this.crude.config({pagination: false});
        return this.crude._readList(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('read', null, true));
      });
      it('should work on read one', function () {
        this.reqres.req.params.id = 'one';
        return this.crude._readOne(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('readOne'));
      });
      it('should work on update', function () {
        this.reqres.req.params.id = 'one';
        return this.crude._update(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('update'));
      });
      it('should work on delete', function () {
        this.reqres.req.params.id = 'one';
        return this.crude._delete(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('delete'));
      });
      it('should work on create', function () {
        return this.crude._create(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('create', 201));
      });

    });

    describe('Custom Success Handler', function () {
      beforeEach(function () {
        this.handleStub = sinon.spy();
        this.crude.onSuccess(this.handleStub);
      });

      it('should work on pagination', function () {
        return this.crude._readList(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('paginate', null, true));

      });
      it('should work on read all', function () {
        this.crude.config({pagination: false});
        return this.crude._readList(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('read', null, true));
      });
      it('should work on read one', function () {
        this.reqres.req.params.id = 'one';
        return this.crude._readOne(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('readOne'));
      });
      it('should work on update', function () {
        this.reqres.req.params.id = 'one';
        return this.crude._update(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('update'));
      });
      it('should work on delete', function () {
        this.reqres.req.params.id = 'one';
        return this.crude._delete(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('delete'));
      });
      it('should work on create', function () {
        return this.crude._create(this.reqres.req, this.reqres.res)
          .bind(this)
          .then(runAssert('create', 201));
      });
    });
  });


});
