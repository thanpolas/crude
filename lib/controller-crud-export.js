/**
 * @fileOverview CRUD controller.
 */
var fs = require('fs');

var __ = require('lodash');
var jade = require('jade');

var CrudCmd = require('./controller-crud-base');
var tplHelpers = require('./tpl-helpers.js');

/**
 * The CRUD Controller
 *
 * @contructor
 * @extends {crude.CrudCmd}
 */
var CrudCtrl = module.exports = CrudCmd.extend(function() {

  this.setOptions();

  // set default view template locations
  this.views = {
    add: __dirname + '/../views/add.jade',
    view: __dirname + '/../views/view.jade',
    list: __dirname + '/../views/list.jade',
    edit: __dirname + '/../views/edit.jade',
  };

  this.compiled = {};
  var self = this;
  __.forOwn(this.views, function(tpl, key) {
    fs.readFile(tpl, function(err, data){
      if (err) {
        console.error('Error Reading file "' + tpl + '", error:', err);
        return;
      }
      self.compiled[key] = jade.compile(data, {
        filename: tpl
      });

    });
  });
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
 * Set the entity instance.
 *
 * @param {Entity} Entity An Entity instance.
 */
CrudCtrl.prototype.setEntity = function(entity) {
  this.entity = entity;
};

/**
 * Set options.
 *
 * @param {Object=} optOptions User defined options.
 */
CrudCtrl.prototype.setOptions = function(optOptions) {
  var userOpts = {};
  if (__.isObject(optOptions)) {
    userOpts = optOptions;
  }

  /** @type {Object} define default options */
  this.opts = __.defaults(userOpts, {
    baseUrl: 'crude',
    urlField: 'localUrl',
    nameField: 'name',
    idField: 'id',
    // A jade view
    layoutView: null,
    // The edit / create view.
    editView: null,
    // The single item view
    itemView: null,
    // The list view
    listView: null,
    // show the doc id
    showId: false,
    // show full path for netsted paths
    expandPaths: false,
    // Callback to set the pagination query.
    paginateQuery: null,
    // paths to exclude when displaying
    viewExcludePaths: [],
  });
};

/**
 * Insert at the beginning of all routes the provided middleware.
 *
 * @param  {Function} middleware The middleware to insert.
 */
CrudCtrl.prototype.unshiftAllRoutes = function(middleware) {
  this.create.unshift(middleware);
  this.createView.unshift(middleware);
  this.readOne.unshift(middleware);
  this.readList.unshift(middleware);
  this.update.unshift(middleware);
  this.updateView.unshift(middleware);
  this.delete.unshift(middleware);
};

/**
 * Insert at the end of all routes the provided middleware.
 *
 * @param  {Function} middleware The middleware to insert.
 */
CrudCtrl.prototype.pushAllRoutes = function(middleware) {
  this.create.push(middleware);
  this.createView.push(middleware);
  this.readOne.push(middleware);
  this.readList.push(middleware);
  this.update.push(middleware);
  this.updateView.push(middleware);
  this.delete.push(middleware);
};

/**
 * Getter for baseUrl variable, overwrite if custom routing is required.
 *
 * @param {Object} req The request Object.
 * @return {string} The baseUrl.
 */
CrudCtrl.prototype.getBaseUrl = function(/* req */) {
  return this.opts.baseUrl;
};

/**
 * Set the baseUrl.
 *
 * @param {string} baseUrl The base url.
 */
CrudCtrl.prototype.setBaseUrl = function(baseUrl) {
  this.opts.baseUrl = baseUrl;
};

/**
 * Prepare the response object for each request, an internal middleware.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function} next callback.
 * @protected
 */
CrudCtrl.prototype._prepResponse = function(req, res, next) {
  res.locals.opts = this.opts;
  res.locals.schema = this.entity.getSchema();
  res.locals.currentUser = req.user;
  // all template functions
  res.locals.fn = {};
  __.extend(res.locals.fn, tplHelpers);
  next();
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
