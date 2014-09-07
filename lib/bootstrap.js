/**
 * @fileOverview Crude Bootstrap module.
 */

var Crude = require('./crude');
var enums = require('./enums');

/**
 * Crude Bootstrap module.
 *
 * @param {string} baseUrl The baseUrl to use.
 * @param {Object} controller The controller.
 * @param {Express=} optExpress An express instance.
 */
var Boot = module.exports = function (baseUrl, controller, optExpress) {
  return new Crude(baseUrl, controller, optExpress);
};

/** @enum {string} Expose the CrudOps enumeration */
Boot.CrudOps = enums.CrudOps;
