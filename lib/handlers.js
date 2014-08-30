/**
 * @fileOverview Success & Error CRUD Handlers.
 */

var cip = require('cip');

var Handlers = module.exports = cip.extend();

/**
 * Handle an error properly depending on request Content-Type
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {string} operation The operation's name.
 * @param {Error} err Error.
 */
Handlers.prototype.handleError = function(req, res, operation, err) {
  res.status(401).json(this.jsonError(err));
};

/**
 * Produce normalized errors.
 *
 * @param {string|Error} err The error message.
 * @return {Object} a normalized error object.
 */
Handlers.prototype.jsonError = function(err) {
  var error = {
    error: true,
    message: '',
  };

  if (typeof err === 'string') {
    error.message = err;
  } else {
    // there's probably a better way than this to infer if the error object
    // will produce any keys when stringified...
    if (Object.keys(JSON.parse(JSON.stringify(err))).length === 0) {
      error.message = err.message;
    } else {
      error = err;
    }
  }

  return error;
};
