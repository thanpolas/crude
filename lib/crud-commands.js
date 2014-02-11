/**
 * @fileOverview The bare CRUD command implementations
 * 
 */

var __ = require('lodash');
var Promise = require('bluebird');

var Controller = require('./controller');
var PaginationMidd = require('./pagination.midd');

/**
 * The CRUD Commands
 *
 * @param {crude.Entity} Entity The Entity class Ctor.
 * @contructor
 * @extends {crude.Controller}
 */
var CrudCmd = module.exports = Controller.extend(function(Entity){
  this.Entity = Entity;

  // prep pagination
  var paginationMidd = new PaginationMidd();

  // define CRUD handlers
  this.create = [
    this._prepResponse.bind(this),
    this._create.bind(this),
  ];
  this.createView = [
    this._prepResponse.bind(this),
    this._createView.bind(this),
  ];
  this.readList = [
    this._prepResponse.bind(this),
    paginationMidd.paginate(Entity),
    this._readList.bind(this),
  ];
  this.readOne = [
    this._prepResponse.bind(this),
    this._readOne.bind(this),
  ];
  this.update = [
    this._prepResponse.bind(this),
    this._update.bind(this),
  ];
  this.updateView = [
    this._prepResponse.bind(this),
    this._updateView.bind(this),
  ];
  this.delete = [this._delete.bind(this)];
});

/** @define {string} The view key in which the output will be available.  */
CrudCmd.VIEW_OUTPUT_KEY = 'crudView';

/**
 * Handle new item creation
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 * @protected
 */
CrudCmd.prototype._create = function(req, res) {
  var rdrUrl = this.getBaseUrl(req) + '/add';
  var entity = new this.Entity(req.user);

  return entity.create(req.body)
    .then(this._handleCreate.bind(this, req, res))
    .then(null, this.handleError.bind(this, req, res, rdrUrl));
};

/**
 * Handle a new item save, this is the CrudCmd Entity Save callback.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Object} document The saved document.
 * @return {Promise} A promise.
 * @protected
 */
CrudCmd.prototype._handleCreate = function(req, res, document){
  return new Promise(function(resolve, reject) {
    var errorMsg = 'An error occured, please try again';
    var error;

    if (!__.isObject(document)) {
      error = new Error(errorMsg);
      error.type = '200';
      return reject(error);
    }

    if (!__.isString(document[this.opts.urlField])) {
      error = new Error(errorMsg);
      error.type = '200';
      return reject(error);
    }

    this.addFlashSuccess(req, document);
    res.redirect(this.getBaseUrl(req) + '/' + document[this.opts.urlField]);

    resolve();
  }.bind(this));
};

/**
 * Create an item view.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._createView = function(req, res){
  this.checkFlashError(req, res);
  this.checkFlashSuccess(req, res);
  res.render(this.opts.editView);
};

/**
 * Handle item listing.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._readList = function(req, res){
  // render the template and store in response locals.
  res.locals[CrudCmd.VIEW_OUTPUT_KEY] = this.compiled.list(res.locals);

  if (!this.opts.layoutView) {
    res.send(res.locals[CrudCmd.VIEW_OUTPUT_KEY]);
  } else {
    res.render(this.opts.layoutView);
  }
};

/**
 * Handle a single item view.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._readOne = function(req, res){
  // attempt to fetch the record...
  var query = new Object(null);
  query[this.opts.urlField] = req.params.id;
  
  var entity = new this.Entity(req.user);
  entity.readOne(query, function(err, doc){
    if (err) {
      this.addError(res, err);
      return res.render(this.views.view);
    }

    if (!doc) {
      var error = new Error('No results');
      this.addError(res, error);
      return res.render(this.views.view);
    }

    // assign the item to the tpl vars.
    res.locals.item = doc;

    this.checkFlashSuccess(req, res);

    // render the template and store in response locals.
    res.locals[CrudCmd.VIEW_OUTPUT_KEY] = this.compiled.view(res.locals);

    if (!this.opts.layoutView) {
      res.send(res.locals[CrudCmd.VIEW_OUTPUT_KEY]);
    } else {
      res.render(this.opts.layoutView);
    }
  }.bind(this));
};

/**
 * Handle item update.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._update = function(req, res) {
  if (!req.body.id) {
    return res.send('Not implemented. No "id" field passed');
  }
  if (!this.opts.editView) {
    return res.send('Not implemented. Define "editView" parameter.');
  }

  var entity = new this.Entity(req.user);
  entity.update(req.body.id, this.process(req.body),
    this._updateCallback.bind(this, req, res));
};


/**
 * Handle an update callback, this is the Entity save callback.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Error=} err Operation failed.
 * @param {mongoose.Document} doc The mongoose document.
 * @protected
 */
CrudCmd.prototype._updateCallback = function(req, res, err, doc){

  if (err) {
    return this.handleError(req, res, err, req.header('Referer'));
  }
  var finalPath = req.url.split('/').pop();

  if (doc[this.opts.urlField] !== finalPath) {
    // log.fine('_updateCallback() :: Changed url. Old:', req.url, 'New:', doc);
    this.addFlashSuccess(req, doc);
    return res.redirect(this.getBaseUrl(req) + '/' + doc[this.opts.urlField]);
  }

  this.addSuccess(res, doc);
  res.locals.item = doc;

  // render the template and store in response locals.
  res.locals[CrudCmd.VIEW_OUTPUT_KEY] = this.compiled.view(res.locals);
  if (!this.opts.layoutView) {
    res.send(res.locals[CrudCmd.VIEW_OUTPUT_KEY]);
  } else {
    res.render(this.opts.layoutView);
  }
};

/**
 * Show single item update view
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._updateView = function(req, res) {
  if (!this.opts.editView) {
    return res.send('Not implemented. Define "editView" parameter.');
  }

  // attempt to fetch the record...
  var query = new Object(null);
  query[this.opts.urlField] = req.params.id;

  var entity = new this.Entity(req.user);
  entity.readOne(query, function(err, doc){
    if (err) {
      this.addError(res, err);
      return res.render(this.opts.editView);
    }

    if (!doc) {
      var error = new Error('No results');
      this.addError(res, error);
      return res.render(this.opts.editView);
    }

    // assign the item to the tpl vars.
    res.locals.item = doc;

    this.checkFlashError(req, res);

    res.render(this.opts.editView);
  }.bind(this));
};


/**
 * Handle item deletion.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._delete = function(req, res){
  res.send('NOT IMPLEMENTED');
};
