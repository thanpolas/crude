/**
 * @fileOverview Testers common library.
 */

var sinon = require('sinon');

var tester = module.exports = {};

/** @type {Object} A stub controller for crude. */
tester.controller = {
  create: sinon.mock(),
  read: sinon.mock(),
  readLimit: sinon.mock(),
  readOne: sinon.mock(),
  update: sinon.mock(),
  count: sinon.mock(),
};
