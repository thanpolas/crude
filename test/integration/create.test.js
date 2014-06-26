/**
 * @fileOverview Create OP tests.
 */
var chai = require('chai');
var expect = chai.expect;

var tester = require('../lib/tester.lib');
var Web = require('../lib/web.lib');
var userFix = require('../fixtures/user.fix');

describe('Create OPs', function() {
  this.timeout(5000);

  tester.init();

  beforeEach(function() {
    var web = new Web();
    this.req = web.req;
  });


  describe('Base', function () {
    it('Should create a record', function (done) {
      this.req.post('/user')
        .send(userFix.one)
        .expect(200)
        .end(function(err, res) {
          console.log(res.body);
          done();
        });
    });
  });
});
