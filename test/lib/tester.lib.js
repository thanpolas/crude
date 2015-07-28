/**
 * @fileOverview Testers common library.
 */

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
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
    create: sinon.stub().returns(item),
    read: sinon.stub().returns([item]),
    readLimit: sinon.stub().returns([item]),
    readOne: sinon.stub().returns(item),
    update: sinon.stub().returns(item),
    count: sinon.stub().returns(1),
    delete: sinon.stub().returns(item),
  };

  return ctrl;
};

/**
 * Returns A stub controller for crude with no records.
 *
 * @return {Object} A stub controller for crude.
 */
tester.controllerEmpty = function() {
  var item = null;
  var ctrl = {
    __item: item,
    create: sinon.stub().returns(item),
    read: sinon.stub().returns([]),
    readLimit: sinon.stub().returns([]),
    readOne: sinon.stub().returns(item),
    update: sinon.stub().returns(item),
    count: sinon.stub().returns(0),
    delete: sinon.stub().returns(item),
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
      status: sinon.stub(),
      set: sinon.stub(),
      json: sinon.stub(),
    },
  };

  reqres.res.status.returns(reqres.res);

  return reqres;
};
