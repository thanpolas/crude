/**
 * @fileOverview Read OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var testHelper = require('../test-helpers.lib');

var read = module.exports = {};

read.test = function(params) {
  describe('Read OPs', function() {
    this.timeout(5000);

    testHelper.setupReq();

    // before create a record
    testHelper.createItem(params);

    // after delete record
    testHelper.deleteItem(params);

    describe('Read list of records', function() {
      it('Should read all records', function(done) {
        this.req.get(params.endpoint)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              console.error('ERROR. Body:', res.body);
              done(err);
              return;
            }

            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(1);
            params.readList.response(res, done);
          });
      });
    });

    describe('Read a single record', function() {
      it('Should read one record', function(done) {
        this.req.get(params.endpoint + '/' + this.item[params.idAttr])
          .expect(200)
          .end(function(err, res) {
            if (err) {
              console.error('ERROR. Body:', res.body);
              done(err);
              return;
            }

            expect(res.body).to.be.an('object');
            params.readItem.response(res, done);
          });
      });
    });

    describe('Read filtered records', function() {
      it('Email filter :: should have right results count', function(done) {
        var filterObj = {};
        filterObj[params.stringAttr] = params.fixture[params.stringAttr];

        this.req.get(params.endpoint)
          .query(filterObj)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              console.error('ERROR. Body:', res.body);
              done(err);
              return;
            }
            expect(res.body).to.have.length(1);
            params.readFilter.response(res, done);
          });
      });
    });
  });
};
