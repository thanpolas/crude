/**
 * @fileOverview CRUD controller.
 */
var fs = require('fs');

var __ = require('lodash');
var jade = require('jade');

var CrudCmd = require('./crud-commands');
var tplHelpers = require('./tpl-helpers.js');

/**
 * The CRUD Controller
 *
 * @param {crude.Entity} Entity The Entity class Ctor.
 * @param {string} baseUrl The base url.
 * @param {Object=} optOpts Optionally define options.
 * @contructor
 * @extends {crude.CrudCmd}
 */
var CrudCtrl = module.exports = CrudCmd.extend(function(Entity, baseUrl, optOpts){
  this.baseUrl = baseUrl;
  this._schemaViews = null;
  var defaultOpts = {
    baseUrl: baseUrl,
    urlField: 'localUrl',
    nameField: 'name',
    idField: 'id',
    // A jade view
    layoutView: null,
    // The edit / create view.
    editView: null,
    // show the doc id
    showId: false,
    // show full path for netsted paths
    expandPaths: false,
    // paths to exclude when displaying
    viewExcludePaths: [],
  };
  this.opts = __.defaults(optOpts, defaultOpts);
  // set default view template locations
  this.views = {
    add: __dirname + '/views/add.jade',
    view: __dirname + '/views/view.jade',
    list: __dirname + '/views/list.jade',
    edit: __dirname + '/views/edit.jade',
  };

  this.compiled = {};

  __.forOwn(this.views, function(tpl, key) {
    fs.readFile(tpl, function(err, data){
      if (err) {
        console.error('Error Reading file "' + tpl + '", error:', err);
        return;
      }
      this.compiled[key] = jade.compile(data, {
        filename: tpl
      });

    }.bind(this));
  }, this);
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
 * Insert at the beginning of all routes the provided middleware.
 *
 * @param  {Function} middleware The middleware to insert.
 */
CrudCtrl.prototype.unshiftAllRoutes = function(middleware) {
  this.create.unshift(middleware);
  this.createView.unshift(middleware);
  this.readList.unshift(middleware);
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
  this.readList.push(middleware);
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
  return this.baseUrl;
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
  var entity = new this.Entity();
  res.locals.schema = entity.getSchema();
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
