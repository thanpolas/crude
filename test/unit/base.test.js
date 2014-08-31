/**
 * @fileOverview Read OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var tester = require('../lib/tester.lig');

var crude = require('../../');

describe('API Surface', function() {
  describe('Ctor Exposed API', function () {
    it('crude should be a function', function() {
      expect(crude).to.be.a('function');
    });
    it('should expose CRUD enum', function() {
      expect(crude.CrudOps).to.be.a('function');
      expect(crude.CrudOps).to.have.keys([
        'CREATE',
        'READ',
        'READ_ONE',
        'PAGINAGE',
        'UPDATE',
        'DELETE',
      ]);
    });
  });

  describe('Instance exposed API', function () {
    beforeEach(function () {
      this.crude = crude('/test', tester.controller);
    });
    it('should expose expected methods', function () {
      expect(this.crude.config).to.be.a('function');
      expect(this.crude.use).to.be.a('function');
      expect(this.crude.addRoutes).to.be.a('function');
      expect(this.crude.onSuccess).to.be.a('function');
      expect(this.crude.onError).to.be.a('function');
      expect(this.crude.create).to.be.a('function');
      expect(this.crude.readOne).to.be.a('function');
      expect(this.crude.readList).to.be.a('function');
      expect(this.crude.update).to.be.a('function');
      expect(this.crude.delete).to.be.a('function');
    });
    it('should generate a new instance', function() {
      this.crude.__test = 1;
      var newCrude = crude('/run', tester.controller);
      expect(newCrude.__test).to.not.equal(this.crude.__test);
    });
    it('should get an instance with the "new" keyword', function() {
      this.crude.__test = 1;
      var newCrude = new crude('/run', tester.controller);
      expect(newCrude.__test).to.not.equal(this.crude.__test);
    });
  });
});
