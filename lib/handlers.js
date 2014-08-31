/**
 * @fileOverview Success & Error CRUD Handlers, a mixin.
 */

var cip = require('cip');
var __ = require('lodash');
var appErr = require('nodeon-error');

var enums = require('./enums');

var Handlers = module.exports = cip.extend();

/**
 * Handle an error properly depending on request Content-Type
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {crude.enums.CrudOps} operation The operation's name.
 * @param {crude.enums.HttpCode} httpCode The HTTP code to use.
 * @param {Error} err Error.
 */
Handlers.prototype.handleError = function(req, res, operation, httpCode, err) {
  res.status(httpCode).json(this.jsonError(err));
};

/**
 * Returns an error handler for use in a promise then().
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {crude.enums.CrudOps} operation The operation's name.
 * @param {crude.enums.HttpCode=} optHttpCode The HTTP code to use.
 */
Handlers.prototype.mkErrorHandler = function(req, res, operation, optHttpCode) {
  var httpCode = optHttpCode || enums.HttpCode.INTERNAL_ERROR;
  var self = this;
  return function(err) {
    self.handleError(req, res, operation, httpCode, err);
  };
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
    message: 'Unknown Error',
  };

  if (typeof err === 'string') {
    error.message = err;
  } else if (err instanceof appErr.Error) {
    error = err.toApi();
  } else if (typeof err.message === 'string'){
    error.message = err.message;
  }

  return error;
};

/**
 * Returns a success handler for use in a promise then().
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {crude.enums.CrudOps} operation The operation's name.
 * @param {crude.enums.HttpCode=} optHttpCode The HTTP code to use.
 */
Handlers.prototype.mkSuccessHandler = function(req, res, operation, optHttpCode) {
  var httpCode = optHttpCode || enums.HttpCode.OK;

  var self = this;

  return function(result) {
    // determine if no results
    if (__.isObject(result)) {
      if (!Object.keys(result).length) {
        httpCode = enums.HttpCode.NOT_FOUND;
      }
    } else if (__.isArray(result)) {
      if (!result.length) {
        httpCode = enums.HttpCode.NOT_FOUND;
      }
    }

    self.handleSuccess(result);

  };
};

/**
 * Handle an error properly depending on request Content-Type
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {crude.enums.CrudOps} operation The operation's name.
 * @param {crude.enums.HttpCode} httpCode The HTTP code to use.
 * @param {*} result The result to send to the client.
 */
Handlers.prototype.handleSuccess = function(req, res, operation, httpCode, result) {
  res.status(httpCode).json(result);
};
