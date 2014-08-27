/*jshint camelcase:false */
/**
 * @fileOverview The bare CRUD command implementations
 *
 */
var EventEmitter = require('events').EventEmitter;

var cip = require('cip');
var mime = require('mime');
var __  = require('lodash');
var middlewarify = require('middlewarify');

var Create = require('./crud-ops/create');
var Read = require('./crud-ops/read');
var Update = require('./crud-ops/update');
var Delete = require('./crud-ops/delete');
var Pagination = require('./crud-ops/pagination');

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

  /** @type {?Entity} An instance of Entity, use setEntity() */
  this.entity = null;

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
 * Determine if request accepts JSON.
 *
 * @param {Object} req The request Object.
 * @return {boolean} yes or no.
 */
CrudCmd.prototype.isJson = function(req) {
  if (this.opts.noViews) {
    return true;
  }
  var acceptHeader = req.header('Accept');
  if (acceptHeader) {
    return mime.extension(acceptHeader) === 'json';
  }
  return false;
};

/**
 * Handle an error properly depending on request Content-Type
 *
 * @param {string} operation The operation's name.
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Error} err Error.
 * @protected
 */
CrudCmd.prototype._handleError = function(operation, req, res, err) {
  res.status(401).json(this.jsonError(err));
};

/**
 * Clean the provided document based on 'canShow' schema property,
 * Check for opts.sanitizeResult callback and invoke it.
 *
 * @param {?Object} doc The document.
 * @return {Object} A cleaned document.
 */
CrudCmd.prototype._sanitizeResult = function(doc) {
  if (!__.isObject(doc)) {
    return doc;
  }
  if (typeof this.opts.sanitizeResult === 'function') {
    return this.opts.sanitizeResult(doc);
  } else {
    var schema = this.entity.getSchema();
    // check for showid and override canshow
    if (this.opts.showId && schema[this.opts['idField']]) {
      schema[this.opts['idField']].canShow = true;
    }

    var sanitizedDoc = Object.create(null);
    Object.keys(schema).forEach(function(schemaKey) {
      if (schema[schemaKey].canShow) {
        sanitizedDoc[schemaKey] = doc[schemaKey];
      }
    });

    return sanitizedDoc;
  }
};

/**
 * Clean an array of items.
 *
 * @param {Array.<Object>} items Multiple Items.
 * @return {Array.<Object>} Cleaned items.
 * @protected
 */
CrudCmd.prototype._sanitizeResultArray = function(items) {
  return items.map(this._sanitizeResult, this);
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
Pagination.prototype.checkOwnUser = function(query, req) {
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
