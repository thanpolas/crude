/**
 * @fileOverview The bare CRUD command implementations
 * 
 */
var Promise = require('bluebird');
var mime = require('mime');

var Controller = require('./controller-base');
var PaginationMidd = require('./pagination.midd');

/**
 * The CRUD Commands
 *
 * @param {Entity} entity An Entity instance.
 * @contructor
 * @extends {crude.Controller}
 */
var CrudCmd = module.exports = Controller.extend(function(entity){
  this.entity = entity;

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
    paginationMidd.paginate(entity),
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
CrudCmd.prototype._create = Promise.method(function(req, res) {
  var rdrUrl = this.getBaseUrl(req) + '/add';
  var entity = new this.Entity(req.user);

  return entity.create(req.body)
    .then(this._handleCreate.bind(this, req, res))
    .catch(this.handleError.bind(this, req, res, rdrUrl));
});

/**
 * Handle a new item save, this is the CrudCmd Entity Save callback.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Object} doc The saved document.
 * @return {Promise} A promise.
 * @protected
 */
CrudCmd.prototype._handleCreate = Promise.method(function(req, res, doc){
  this.addFlashSuccess(req, doc);
  res.redirect(this.getBaseUrl(req) + '/' + doc[this.opts.urlField]);
});

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
 * @return {Promise} A promise.
 * @protected
 */
CrudCmd.prototype._readOne = Promise.method(function(req, res){
  // attempt to fetch the record...
  var query = new Object(null);
  query[this.opts.urlField] = req.params.id;
  var self = this;
  return this.entity.readOne(query).then(function(doc){
    // assign the item to the tpl vars.
    res.locals.item = doc;

    self.checkFlashSuccess(req, res);

    // render the template and store in response locals.
    res.locals[CrudCmd.VIEW_OUTPUT_KEY] = self.compiled.view(res.locals);

    if (!self.opts.layoutView) {
      res.send(res.locals[CrudCmd.VIEW_OUTPUT_KEY]);
    } else {
      res.render(self.opts.layoutView);
    }
  }).then(null, function(err) {
    self.addError(res, err);
    res.render(this.views.view);
    throw (err);
  });
});

/**
 * Handle item update.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 * @protected
 */
CrudCmd.prototype._update = Promise.method(function(req, res) {
  if (!req.body.id) {
    return res.send('No "id" field passed');
  }
  if (!this.opts.editView) {
    return res.send('Define "editView" parameter.');
  }

  return this.entity.update(req.body.id, this.process(req.body))
    .then(this._handleUpdate.bind(this, req, res))
    .catch(this.handleError.bind(this, req, res, req.header('Referer')));
});

/**
 * Handle an update callback, this is the Entity save callback.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Object} doc The saved document.
 * @protected
 */
CrudCmd.prototype._handleUpdate = function(req, res, doc){

  var finalPath = req.url.split('/').pop();

  if (doc[this.opts.urlField] !== finalPath) {
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
CrudCmd.prototype._updateView = Promise.method(function(req, res) {
  if (!this.opts.editView) {
    var errMsg = 'Not implemented. Define "editView" parameter.';
    res.send(errMsg);
    throw new Error(errMsg);
  }

  var self = this;

  // attempt to fetch the record...
  var query = new Object(null);
  query[this.opts.urlField] = req.params.id;


  return this.entity.readOne(query).then(function(doc){
    // assign the item to the tpl vars.
    res.locals.item = doc;
    self.checkFlashError(req, res);
    res.render(self.opts.editView);
  }).catch(function(err) {
    self.addError(res, err);
    res.render(self.opts.editView);
    throw err;
  });

});


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

/**
 * Handle an error properly depending on request Content-Type
 * 
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {string} redirectUrl Define a redirect url.
 * @param {Error} err Error.
 * @throws Error whatever came through.
 */
CrudCmd.prototype.handleError = function(req, res, redirectUrl, err) {
  switch(mime.extension(req.header('Accept'))) {
  case 'json':
    res.statusCode = 400;
    res.contentType('json');
    res.write(JSON.stringify(err));
    res.end();
    break;
  default:
    this.addFlashError(req, err);
    res.redirect(redirectUrl);
    break;
  }
  throw err;
};
