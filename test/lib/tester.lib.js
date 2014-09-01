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
  return {
    create: sinon.mock(),
    read: sinon.mock(),
    readLimit: sinon.mock(),
    readOne: sinon.mock(),
    update: sinon.mock(),
    count: sinon.mock(),
  };
};

/**
 * Return express Request / Response objects.
 *
 * @return {Object} Req Res mocks.
 */
tester.reqres = function() {
  return {
    req: {},
    res: {},
  };
};
