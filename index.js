/**
 * @fileOverview bootstrap file for crude
 */

var crude = module.exports = require('./lib/controller-crud-export');

crude.route = require('./lib/route');
crude.Test = require('./test/export/generic-crud-test.lib');
