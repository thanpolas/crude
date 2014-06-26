/*jshint camelcase:false */
/**
 * @fileOverview The bare CRUD command implementations
 *
 */
var mime = require('mime');

var Controller = require('./controller-base');
var PaginationMidd = require('./pagination.midd');

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
var CrudCmd = module.exports = Controller.extend(function(){
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

  // prep pagination
  this.pagination = new PaginationMidd();

  // define CRUD handlers
  this.create = [
    this._prepResponse.bind(this),
    this.createOp.create.bind(this.createOp),
  ];
  this.createView = [
    this._prepResponse.bind(this),
    this.createOp.createView.bind(this.createOp),
  ];

  this.readList = [];
  this.readOp.setupReadList();

  this.readOne = [
    this._prepResponse.bind(this),
    this.readOp.readOne.bind(this.readOp),
  ];
  this.update = [
    this._prepResponse.bind(this),
    this.updateOp.update.bind(this.updateOp),
  ];
  this.updateView = [
    this._prepResponse.bind(this),
    this.updateOp.updateView.bind(this.updateOp),
  ];
  this.delete = [this.deleteOp.delete.bind(this.deleteOp)];
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
 * Handle a successful outcome by either rendering or JSONing.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Object} doc The document item.
 * @private
 */
CrudCmd.prototype._handleSuccess = function(req, res, doc) {
  if (this.isJson(req)) {
    var sanitizedDoc = this._sanitizeResult(doc);
    res.json(200, sanitizedDoc);
  } else {
    // assign the item to the tpl vars.
    res.locals.item = doc;
    // construct the item's url
    // var itemUrl = path.join(this.getBaseUrl(req, true), doc[this.opts.urlField]);
    // res.locals.item.itemUrl = path.normalize(itemUrl) + '/';

    this.checkFlashSuccess(req, res);

    if (this.opts.itemView) {
      return res.render(this.opts.itemView);
    }

    // render the template and store in response locals.
    res.locals[CrudCmd.VIEW_OUTPUT_KEY] = this.compiled.view(res.locals);
    if (this.opts.layoutView) {
      res.render(this.opts.layoutView);
    } else {
      res.send(res.locals[CrudCmd.VIEW_OUTPUT_KEY]);
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
  if (this.isJson(req)) {
    res.json(200, this._sanitizeResult(doc));
  } else {
    res.redirect(this.getBaseUrl(req, true) + '/' + doc[this.opts.urlField]);
  }
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
 * @throws Error whatever came through.
 */
CrudCmd.prototype._handleErrorRedirect = function(req, res, redirectUrl, err) {
  var acceptHeader = req.header('Accept');
  var accepts = null;
  if (acceptHeader) {
    accepts = mime.extension(acceptHeader);
  }
  if (this.opts.noViews) {
    accepts = 'json';
  }
  switch(accepts) {
  case 'json':
    res.status(401).json(this.jsonError(err));
    break;
  default:
    this.addFlashError(req, err);
    res.redirect(redirectUrl);
    break;
  }
};

/**
 * Clean the provided document based on 'canShow' schema property,
 * Check for opts.sanitizeResult callback and invoke it.
 *
 * @param {Object} doc The document.
 * @return {Object} A cleaned document.
 */
CrudCmd.prototype._sanitizeResult = function(doc) {
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
