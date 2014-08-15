/*jshint camelcase:false */
/**
 * @fileOverview The bare CRUD command implementations
 *
 */
var mime = require('mime');
var __  = require('lodash');
var middlewarify = require('middlewarify');

var Controller = require('./controller-base');

var Create = require('./crud-ops/create');
var Read = require('./crud-ops/read');
var Update = require('./crud-ops/update');
var Delete = require('./crud-ops/delete');

/**
 * The CRUD Commands
 *
 * @contructor
 * @extends {crude.Controller}
 */
var CrudCmd = module.exports = Controller.extend(function() {
  /** @type {app.ctrl.Create} Instance of Create op */
  this.createOp = new Create(this);
  /** @type {app.ctrl.Read} Instance of Read op */
  this.readOp = new Read(this);
  /** @type {app.ctrl.Update} Instance of Update op */
  this.updateOp = new Update(this);
  /** @type {app.ctrl.Delete} Instance of Delete op */
  this.deleteOp = new Delete(this);

  /** @type {Object} Options, look at setOptions() */
  this.opts = {};

  /** @type {?Entity} An instance of Entity, use setEntity() */
  this.entity = null;

  // define CRUD handlers
  middlewarify.make(this, 'create', this.createOp.create.bind(this.createOp));
  middlewarify.make(this, 'readOne', this.readOp.readOne.bind(this.readOp));
  middlewarify.make(this, 'readList', this.readOp.read.bind(this.readOp));
  middlewarify.make(this, 'update', this.updateOp.update.bind(this.updateOp));
  middlewarify.make(this, 'delete', this.deleteOp.delete.bind(this.deleteOp));
});

/**
 * Handle a successful outcome by either rendering or JSONing.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Object} doc The document item.
 * @private
 */
CrudCmd.prototype._handleSuccess = function(req, res, doc) {
  if (!doc) {
    res.status(404).json({});
    return;
  }

  var sanitizedDoc = this._sanitizeResult(doc);
  res.status(200).json(sanitizedDoc);
};

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
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {string} redirectUrl Define a redirect url.
 * @param {Error} err Error.
 * @protected
 */
CrudCmd.prototype._handleError = function(req, res, redirectUrl, err) {
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
 */
CrudCmd.prototype.hidePrivatesArray = function(items) {
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
