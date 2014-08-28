/*jshint camelcase:false */
/**
 * @fileOverview The bare CRUD command implementations
 *
 */
var EventEmitter = require('events').EventEmitter;

var cip = require('cip');
var __  = require('lodash');
var middlewarify = require('middlewarify');

var Create = require('./crud-ops/create');
var Read = require('./crud-ops/read');
var Update = require('./crud-ops/update');
var Delete = require('./crud-ops/delete');
var Pagination = require('./crud-ops/pagination');
var appErr = require('nodeon-error');

// sign the error objects
appErr.setName('crude');

var CeventEmitter = cip.cast(EventEmitter);

/**
 * The CRUD Commands
 *
 * @contructor
 * @extends {EventEmitter}
 */
var CrudCmd = module.exports = CeventEmitter.extend(function() {
  /** @type {Object} Options, look at setOptions() */
  this.opts = {};

  // define CRUD handlers
  middlewarify.make(this, 'create', this._create.bind(this));
  middlewarify.make(this, 'readOne', this._readOne.bind(this));
  middlewarify.make(this, 'readList', this._read.bind(this));
  middlewarify.make(this, 'update', this._update.bind(this));
  middlewarify.make(this, 'delete', this._delete.bind(this));
});
CrudCmd.mixin(Create);
CrudCmd.mixin(Read);
CrudCmd.mixin(Update);
CrudCmd.mixin(Delete);
CrudCmd.mixin(Pagination);

/**
 * Handle an error properly depending on request Content-Type
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {string} operation The operation's name.
 * @param {Error} err Error.
 */
CrudCmd.prototype.handleError = function(req, res, operation, err) {
  res.status(401).json(this.jsonError(err));
};

/**
 * Produce normalized errors.
 *
 * @param {string|Error} err The error message.
 * @return {Object} a normalized error object.
 */
CrudCmd.prototype.jsonError = function(err) {
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

/**
 * Check if own user is required and enforce it.
 *
 * @param {Object} query The normalized query.
 * @param {Object} req The request Object.
 * @return {boolean} Go or no go.
 */
CrudCmd.prototype.checkOwnUser = function(query, req) {
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] =
      req[this.opts.ownUserRequestProperty];

    // a falsy value (null/undefined) means user is not logged in
    if (!query[this.opts.ownUserSchemaProperty]) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
};

/**
 * Will check for "own user" flag and enforce it in the query.
 *
 * @param {Object} query The normalized query.
 * @param {Object} req The request Object.
 * @private
 */
CrudCmd.prototype._forceOwnUser = function(query, req) {
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] =
      req[this.opts.ownUserRequestProperty];
  }
};
