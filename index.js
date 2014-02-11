/**
 * @fileOverview bootstrap file for crude
 */

var crude = module.exports = {};

crude.route = require('./lib/route');
crude.Controller = require('./lib/controller-base');
crude.ControllerCrud = require('./lib/controller-crud-export');
