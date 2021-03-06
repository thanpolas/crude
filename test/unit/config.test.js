/**
 * @fileOverview Configuration tests.
 */
var Promise = require('bluebird');
var sinon = require('sinon');

var tester = require('../lib/tester.lib');
var chai = require('chai');
var expect = chai.expect;

var crude = require('../../');

describe('Configuration tests', function () {
  beforeEach(function () {
    this.ctrl = tester.controller();
    this.crude = crude('/middleware', this.ctrl);
    this.reqres = tester.reqres();
    this.stub = sinon.stub();
  });

  describe('Surface tests', function () {
    it('config returns self', function () {
      expect(this.crude.config()).to.equal(this.crude);
    });
  });

  describe('Configurability tests', function () {

    describe('Configure the "idField"', function () {
      beforeEach(function () {
        return this.crude.config({
          idField: '_id'
        });
      });

      beforeEach(function () {
        this.reqres.req.params.id = 'one';
        return Promise.all([
          this.crude._readOne(this.reqres.req, this.reqres.res),
          this.crude._update(this.reqres.req, this.reqres.res),
          this.crude._delete(this.reqres.req, this.reqres.res),
        ]);
      });

      it('readOne OP', function () {
        expect(this.ctrl.readOne).to.have.been.calledWith({_id: 'one'});
      });
      it('update OP', function () {
        expect(this.ctrl.update).to.have.been.calledWith({_id: 'one'});
      });
      it('delete OP', function () {
        expect(this.ctrl.delete).to.have.been.calledWith({_id: 'one'});
      });
    });
  });
});
