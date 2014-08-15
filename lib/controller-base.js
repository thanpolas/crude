/**
 * @fileOverview The base Controller Class.
 */
var cip = require('cip');

/**
 * The base Controller Class all controllers extend from.
 *
 * @constructor
 */
module.exports = cip.extend(function() {
  /**
   * An array of controlling funcs that will handle requests.
   *
   *
   * @type {Array.<Function(Object, Object)}
   */
  this.use = [];

});
