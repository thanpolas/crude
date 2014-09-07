/**
 * @fileOverview Crude Bootstrap module.
 */

var Crude = require('./crude');

/**
 * Crude Bootstrap module.
 *
 * @param {string} baseUrl The baseUrl to use.
 * @param {Object} controller The controller.
 * @param {Express=} optExpress An express instance.
 */
module.exports = function (baseUrl, controller, optExpress) {
  return new Crude(baseUrl, controller, optExpress);
};
