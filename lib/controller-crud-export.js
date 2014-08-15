/**
 * @fileOverview CRUD controller.
 */

var __ = require('lodash');
// var middlewarify = require('middlewarify');

var CrubBaseCtrl = require('./controller-crud-base');

/**
 * The CRUD Controller
 *
 * @param {string} route The route to use.
 * @param {Object} controller The controller.
 * @contructor
 * @extends {crude.CrubBaseCtrl}
 */
var CrudCtrl = module.exports = CrubBaseCtrl.extend(function(route, controller) {
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

  this._setDefaults();
});

/**
 * Mark the proto to check for proper inheritance of methods,
 * we do this so we can lax comparison by not relying 100% on "instanceof".
 *
 * @type {boolean}
 * @protected
 */
CrudCtrl.prototype._isCrude = true;

/**
 * Configure crude.
 *
 * @param {Object} options Key value pairs.
 * @return {self} Chainable.
 */
CrudCtrl.prototype.config = function(options) {
  __.extend(this.opts, options);

  this.readOp.setupReadList();

  return this;
};

/**
 * Set Default options.
 *
 */
CrudCtrl.prototype._setDefaults = function() {
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
CrudCtrl.prototype.use = function(middleware) {
  this.create.use(middleware);
  this.readOne.use(middleware);
  this.readList.use(middleware);
  this.update.use(middleware);
  this.delete.use(middleware);
};

/**
 * Getter for baseUrl variable, overwrite if custom routing is required.
 *
 * @param {Object} req The request Object.
 * @param {boolean=} hasId set to true if url contains the item id.
 * @return {string} The baseUrl.
 */
CrudCtrl.prototype.getBaseUrl = function(req, hasId) {
  var url = req.url;
  var reClearUrl = /\/edit|\/add/;
  url = url.replace(reClearUrl, '');
  var len = url.length;

  // remove trailing slash if its there
  if (url[len - 1] === '/') {
    url = url.substr(0, len -1);
  }
  if (hasId) {
    // Remove the :id part
    var idPart = '/' + url.split('/').pop();
    url = url.replace(idPart, '');
  }
  return url;
};

/**
 * Process incoming POST vars, we will:
 *  * Remove all vars starting with underscore ( _ ).
 *
 *
 * This is not a validation step, just forbid "private" keys from passing.
 *
 * @param  {Object} params Hash with key / value pairs
 * @return {Object} a processed object.
 */
CrudCtrl.prototype.process = function(params) {
  var outObj = {};
  __.forOwn(params, function(value, key){
    if ('_' !== key.charAt(0)) {
      outObj[key] = value;
    }
  });

  return outObj;
};
