/*jshint camelcase:false */
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
 * @contructor
 * @extends {crude.Controller}
 */
var CrudCmd = module.exports = Controller.extend(function(){
  /** @type {Object} Options, look at setOptions() */
  this.opts = {};

  /** @type {?Entity} An instance of Entity, use setEntity() */
  this.entity = null;

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
    paginationMidd.paginate(this),
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
 * Prepare the response object for each request, an internal middleware.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._prepResponse = function() {
  throw new Error('Not Implemented');
};

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
  return this.entity.create(req.body)
    .then(this._handleSuccessRedirect.bind(this, req, res))
    .catch(this._handleErrorRedirect.bind(this, req, res, rdrUrl));
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
CrudCmd.prototype._readList = function(req, res) {
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
CrudCmd.prototype._readOne = Promise.method(function(req, res) {
  // attempt to fetch the record...
  var query = new Object(null);
  query[this.opts.urlField] = req.params.id;
  return this.entity.readOne(query)
    .then(this._handleSuccess.bind(this, req, res))
    .catch(this._handleError.bind(this, req, res));
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
    .then(this.entity.readOne.bind(this.entity, req.body.id))
    .then(this._handleUpdate.bind(this, req, res))
    .catch(this._handleErrorRedirect.bind(this, req, res, req.header('Referer')));
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
  if (this._isJson(req)) {
    var sanitizedDoc = this._hidePrivates(doc);
    return res.json(200, sanitizedDoc);
  }

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
 * Handle a successful outcome by either rendering or JSONing.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Object} doc The document item.
 * @private
 */
CrudCmd.prototype._handleSuccess = function(req, res, doc) {
  if (this._isJson(req)) {
    var sanitizedDoc = this._hidePrivates(doc);
    res.json(200, sanitizedDoc);
  } else {
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
  }
};

/**
 * Handle an success outcome properly depending on request Content-Type
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Object} doc A document.
 * @private
 */
CrudCmd.prototype._handleSuccessRedirect = function(req, res, doc) {
  if (this._isJson(req)) {
    var sanitizedDoc = this._sanitize(doc);
    res.json(200, sanitizedDoc);
  } else {
    res.redirect(this.getBaseUrl(req) + '/' + doc[this.opts.urlField]);
  }
};

/**
 * Determine if request accepts JSON.
 *
 * @param {Object} req The request Object.
 * @return {boolean} yes or no.
 * @private
 */
CrudCmd.prototype._isJson = function(req) {
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
 * @throws Error whatever came through.
 */
CrudCmd.prototype._handleErrorRedirect = function(req, res, redirectUrl, err) {
  var acceptHeader = req.header('Accept');
  var accepts = null;
  if (acceptHeader) {
    accepts = mime.extension(acceptHeader);
  }
  switch(accepts) {
  case 'json':
    res.json(400, err);
    break;
  default:
    this.addFlashError(req, err);
    res.redirect(redirectUrl);
    break;
  }
};


/**
 * Handle Error.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Error|string} err The error.
 * @private
 */
CrudCmd.prototype._handleError = function(req, res, err) {
  this.addError(res, err);
  res.render(this.views.view);
  throw (err);
};

/**
 * Clean the provided document based on 'canShow' schema property.
 *
 * @param {Object} doc The document.
 * @return {Object} A cleaned document.
 */
CrudCmd.prototype._hidePrivates = function(doc) {
  var schema = this.entity.getSchema();
  var sanitizedDoc = Object.create(null);

  Object.keys(schema).forEach(function(schemaKey) {
    if (schema[schemaKey].canShow) {
      sanitizedDoc[schemaKey] = doc[schemaKey];
    }
  });

  return sanitizedDoc;
};
