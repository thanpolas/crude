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
 * @param {string} baseUrl The baseUrl to use.
 * @param {Object} controller The controller.
 * @contructor
 * @extends {EventEmitter}
 */
var Crude = module.exports = CeventEmitter.extend(function(baseUrl, controller) {
  if (!(this instanceof Crude)) {
    return new Crude(baseUrl, controller);
  }

  if (typeof baseUrl !== 'string') {
    throw new TypeError('First argument should be a string represeting the baseUrl');
  }

  // will throw proper error
  this._validateController(controller);

  /** @type {Object} Options, look at setOptions() */
  this.opts = {};

  /** @type {string} The route to use. */
  this.baseUrl = baseUrl;

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
Crude.mixin(Create);
Crude.mixin(Read);
Crude.mixin(Update);
Crude.mixin(Delete);
Crude.mixin(Pagination);

/**
 * Mark the proto to check for proper inheritance of methods,
 * we do this so we can lax comparison by not relying 100% on "instanceof".
 *
 * @type {boolean}
 * @protected
 */
Crude.prototype._isCrude = true;

/**
 * Configure crude.
 *
 * @param {Object} options Key value pairs.
 * @return {self} Chainable.
 */
Crude.prototype.config = function(options) {
  __.extend(this.opts, options);

  this.readOp.setupReadList();

  return this;
};

/**
 * Set Default options.
 *
 */
Crude.prototype._setDefaults = function() {
  this.opts = {
    // Map the ID visible in URLs to a DB attribute.
    urlIdAttr: 'id',

    // The actual DB id attribute.
    idField: 'id',
    nameField: 'name',
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
Crude.prototype.use = function(middleware) {
  this.create.use(middleware);
  this.readOne.use(middleware);
  this.readList.use(middleware);
  this.update.use(middleware);
  this.delete.use(middleware);
};

/**
 * The actual route add operation, decoupled from add to skip instanceof checks.
 *
 * @param {express} app The express instance.
 * @param {string} baseUrl The base URL to attach the routes.
 * @param {crude.Crude} crude an instance if crude.
 */
Crude.addRoutes = function(app) {
  app.get(this.baseUrl, this.readList);
  app.post(this.baseUrl, this.create);
  app.get(this.baseUrl + '/:id', this.readOne);
  app.post(this.baseUrl + '/:id', this.update);
  app.delete(this.baseUrl + '/:id', this.delete);
};

/**
 * Handle an error properly depending on request Content-Type
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {string} operation The operation's name.
 * @param {Error} err Error.
 */
Crude.prototype.handleError = function(req, res, operation, err) {
  res.status(401).json(this.jsonError(err));
};

/**
 * Produce normalized errors.
 *
 * @param {string|Error} err The error message.
 * @return {Object} a normalized error object.
 */
Crude.prototype.jsonError = function(err) {
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
Crude.prototype.checkOwnUser = function(query, req) {
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
Crude.prototype._forceOwnUser = function(query, req) {
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] =
      req[this.opts.ownUserRequestProperty];
  }
};

/**
 * Validates a controller has the expected functions.
 *
 * @param {Object} ctrl The controller to validate.
 * @throws {TypeError} If not valid.
 */
Crude.prototype._validateController = function(ctrl) {
  if (!__.isObject(ctrl)) {
    throw new TypeError('Injected Controller not of type Object');
  }

  if (typeof ctrl.create !== 'function') {
    throw new TypeError('Injected Controller does not contain the "create" method');
  }
  if (typeof ctrl.read !== 'function') {
    throw new TypeError('Injected Controller does not contain the "read" method');
  }
  if (typeof ctrl.readLimit !== 'function') {
    throw new TypeError('Injected Controller does not contain the "readLimit" method');
  }
  if (typeof ctrl.readOne !== 'function') {
    throw new TypeError('Injected Controller does not contain the "readOne" method');
  }
  if (typeof ctrl.update !== 'function') {
    throw new TypeError('Injected Controller does not contain the "update" method');
  }
  if (typeof ctrl.count !== 'function') {
    throw new TypeError('Injected Controller does not contain the "count" method');
  }
};