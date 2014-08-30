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
 * @param {string} route The route to use.
 * @param {Object} controller The controller.
 * @contructor
 * @extends {EventEmitter}
 */
var CrudBase = module.exports = CeventEmitter.extend(function(route, controller) {
  /** @type {Object} Options, look at setOptions() */
  this.opts = {};

  /** @type {string} The route to use. */
  this.route = route;

  /**
   * @type {Object} Object with the expected key / callbacks.
   *       @param {Function(Object)} create
   *       @param {Function(Object)} read
   *       @param {Function(Object)} readLimit
   *       @param {Function(Object)} readOne
   *       @param {Function(Object)} update
   *       @param {Function(Object)} count
   */
  this.controller = controller;

  // define CRUD handlers
  middlewarify.make(this, 'create', this._create.bind(this));
  middlewarify.make(this, 'readOne', this._readOne.bind(this));
  middlewarify.make(this, 'readList', this._read.bind(this));
  middlewarify.make(this, 'update', this._update.bind(this));
  middlewarify.make(this, 'delete', this._delete.bind(this));

  this._setDefaults();

});
CrudBase.mixin(Create);
CrudBase.mixin(Read);
CrudBase.mixin(Update);
CrudBase.mixin(Delete);
CrudBase.mixin(Pagination);

/**
 * Mark the proto to check for proper inheritance of methods,
 * we do this so we can lax comparison by not relying 100% on "instanceof".
 *
 * @type {boolean}
 * @protected
 */
CrudBase.prototype._isCrude = true;

/**
 * Configure crude.
 *
 * @param {Object} options Key value pairs.
 * @return {self} Chainable.
 */
CrudBase.prototype.config = function(options) {
  __.extend(this.opts, options);

  this.readOp.setupReadList();

  return this;
};

/**
 * Set Default options.
 *
 */
CrudBase.prototype._setDefaults = function() {
  this.opts = {
    baseUrl: 'crude',
    urlField: 'localUrl',
    nameField: 'name',
    idField: 'id',
    // Define this key so 'from' & 'to' params query the right attribute
    dateField: 'createdAt',
    // show the doc id
    showId: false,
    // show full path for netsted paths
    expandPaths: false,
    // Callback that sanitizes produced result, trumps built-in sanitizer.
    sanitizeResult: null,
    // Do not use views, API (JSON) responses only.
    noViews: false,
    // Set to true to check if user owns the item.
    ownUser: false,
    // required by "ownUser" the property in the request object that represents
    // the user id.
    ownUserRequestProperty: null,
    // required by "ownUser" the schema attribute that represents the user id.
    ownUserSchemaProperty: null,

    // Set to false to not paginate.
    pagination: true,
    // Callback to set the pagination query.
    paginateQuery: null,
    // Default item to limit to on pagination.
    paginateLimit: 6,

    // Key value pairs matching attributes to labels
    labels: {},
  };
};

/**
 * Insert at the beginning of all routes the provided middleware.
 *
 * @param {Function} middleware The middleware to insert.
 */
CrudBase.prototype.use = function(middleware) {
  this.create.use(middleware);
  this.readOne.use(middleware);
  this.readList.use(middleware);
  this.update.use(middleware);
  this.delete.use(middleware);
};


/**
 * Handle an error properly depending on request Content-Type
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {string} operation The operation's name.
 * @param {Error} err Error.
 */
CrudBase.prototype.handleError = function(req, res, operation, err) {
  res.status(401).json(this.jsonError(err));
};

/**
 * Produce normalized errors.
 *
 * @param {string|Error} err The error message.
 * @return {Object} a normalized error object.
 */
CrudBase.prototype.jsonError = function(err) {
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
 * Check if own user is required and return the outcome.
 *
 * @param {Object} query The normalized query.
 * @param {Object} req The request Object.
 * @return {boolean} Go or no go.
 */
CrudBase.prototype.checkOwnUser = function(query, req) {
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
CrudBase.prototype._forceOwnUser = function(query, req) {
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] =
      req[this.opts.ownUserRequestProperty];
  }
};
