/**
 * @fileOverview UPDATE OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var testHelper = require('../test-helpers.lib');

var update = module.exports = {};

update.test = function(params) {
  describe('Update OPs', function() {
    this.timeout(5000);

    testHelper.setupReq(params);

    // before create a record
    testHelper.createItem(params);

    // after delete record
    testHelper.deleteItem(params);

    it('Should Update records', function (done) {
      var updateObj = {};
      updateObj[params.stringAttr] = 'new value';

      this.req.post(params.endpoint + '/' + this.item[params.idAttr])
        .send(updateObj)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            console.error('ERROR. Body:', res.body);
            done(err);
            return;
          }

          expect(res.body[params.stringAttr]).to.equal('new value');
          params.update.response(res, done);
        });
    });
  });
};
