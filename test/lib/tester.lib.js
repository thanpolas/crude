/**
 * @fileOverview Testers common library.
 */

var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var chai = require('chai');
chai.use(sinonChai);

var tester = module.exports = {};

/**
 * Returns A stub controller for crude.
 *
 * @return {Object} A stub controller for crude.
 */
tester.controller = function() {
  var item = {a: 1};
  var ctrl = {
    __item: item,
    create: sinon.mock().returns(item),
    read: sinon.mock().returns([item]),
    readLimit: sinon.mock().returns([item]),
    readOne: sinon.mock().returns(item),
    update: sinon.mock().returns(item),
    count: sinon.mock().returns(1),
    delete: sinon.mock(),
  };

  return ctrl;
};

/**
 * Return express Request / Response objects.
 *
 * @return {Object} Req Res mocks.
 */
tester.reqres = function() {
  var reqres = {
    req: {
      query: {},
      body: {},
      params: {},
      url: 'http://localhost/',
      app: {
        settings: {
          port: 80,
        },
      },
    },
    res: {
      status: sinon.mock(),
      set: sinon.mock(),
      json: sinon.mock(),
    },
  };

  reqres.res.status.returns(reqres.res);

  return reqres;
};
