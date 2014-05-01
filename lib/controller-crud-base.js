/*jshint camelcase:false */
/**
 * @fileOverview The bare CRUD command implementations
 *
 */
var path = require('path');

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
  this.pagination = new PaginationMidd();

  // define CRUD handlers
  this.create = [
    this._prepResponse.bind(this),
    this._create.bind(this),
  ];
  this.createView = [
    this._prepResponse.bind(this),
    this._createView.bind(this),
  ];


  this.readList = [];
  this._setupReadList();

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
 * Will force setup the readlist command middleware which depend on
 * consumer configuration.
 *
 * @protected
 */
CrudCmd.prototype._setupReadList = function() {
  this.readList = [this._prepResponse.bind(this)];
  if (!this.opts.noPagination) {
    this.readList.push(this.pagination.paginate(this));
    this.readList.push(this._readListResults.bind(this));
  } else {
    this.readList.push(this._readList.bind(this));
  }
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
  var self = this;
  return this.entity[this.opts.entityCreate](req.body)
    .then(function(doc) {
      if (self.isJson(req)) {
        var sanitizedDoc = self._sanitizeResult(doc);
        res.json(200, sanitizedDoc);
      } else {
        res.redirect(self.getBaseUrl(req) + '/' + doc[self.opts.urlField]);
      }
    })
    .catch(this._handleErrorRedirect.bind(this, req, res, rdrUrl));
});

/**
 * Create an item view.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._createView = function(req, res) {
  if (this.opts.noViews) {
    return res.status(401).json(this.jsonError('Wrong turn'));
  }
  this.checkFlashError(req, res);
  this.checkFlashSuccess(req, res);
  res.render(this.opts.editView);
};


/**
 * Read all the items.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._readList = function(req, res) {
  var self = this;
  var query = Object.create(null);
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] = req[this.opts.ownUserRequestProperty];
  }
  this.entity[this.opts.entityRead](query)
    .then(function(results) {
      if (self.isJson(req)) {
        var sanitizedDocs = self.hidePrivatesArray(results);
        res.json(200, sanitizedDocs);
        return;
      }
      res.locals.items = results;
      res.locals.count = results.length;
      self._readListResults(req, res);
    }).catch(this._handleReadError.bind(this, req, res, this.opts.listView));
};

/**
 * Handle item pagination results.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._readListResults = function(req, res) {
  if (this.isJson(req)) {
    // paginator handled it
    return;
  }

  if (this.opts.listView) {
    return res.render(this.opts.listView);
  }

  // render the template and store in response locals.
  res.locals[CrudCmd.VIEW_OUTPUT_KEY] = this.compiled.list(res.locals);
  if (this.opts.layoutView) {
    res.render(this.opts.layoutView);
  } else {
    res.send(res.locals[CrudCmd.VIEW_OUTPUT_KEY]);
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
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] = req[this.opts.ownUserRequestProperty];
  }

  return this.entity[this.opts.entityReadOne](query)
    .then(this._handleSuccess.bind(this, req, res))
    .catch(this._handleReadError.bind(this, req, res, this.view.view));
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
  var self = this;
  function validationError(err) {
    if (self.isJson(req)) {
      res.status(400).json(self.jsonError(err));
    } else {
      res.status(400).send(err);
    }
  }
  var itemId = req.body.id || req.params.id;
  if (!itemId) {
    return validationError('No "id" field passed');
  }
  if (!this.opts.noViews && !this.opts.editView) {
    return validationError('Define "editView" parameter.');
  }
  var query = Object.create(null);

  query[this.opts.idField] = itemId;
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] = req[this.opts.ownUserRequestProperty];
  }

  return this.entity.update(query, this.process(req.body))
    .then(this.entity.readOne.bind(this.entity, itemId))
    .then(this._handleSuccessRedirect.bind(this, req, res))
    .catch(this._handleErrorRedirect.bind(this, req, res, req.header('Referer')));
});

/**
 * Show single item update view
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCmd.prototype._updateView = Promise.method(function(req, res) {
  if (this.opts.noViews) {
    return res.status(401).json(this.jsonError('Wrong turn'));
  }

  if (!this.opts.editView) {
    var errMsg = 'Not implemented. Define "editView" parameter.';
    res.send(errMsg);
    throw new Error(errMsg);
  }

  var self = this;

  // attempt to fetch the record...
  var query = new Object(null);
  query[this.opts.urlField] = req.params.id;
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] = req[this.opts.ownUserRequestProperty];
  }

  return this.entity.readOne(query).then(function(doc) {
    if (!doc) {
      throw new Error('Network not found, id: ' + req.params.id);
    }

    // assign the item to the tpl vars.
    res.locals.item = doc;
    // construct the item's url
    var itemUrl = path.join(self.getBaseUrl(req, true), doc[self.opts.urlField]);
    res.locals.opts.itemUrl = path.normalize(itemUrl) + '/';
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
  var query = new Object(null);
  query[this.opts.urlField] = req.params.id;
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] = req[this.opts.ownUserRequestProperty];
  }

  var self = this;
  return this.entity.delete(query)
    .then(function() {
      if (self.isJson(req)) {
        return res.json(200);
      }
      self.addSuccess(res);
      res.redirect(self.getBaseUrl(req, true));
    }).catch(function(err) {
      if (self.isJson(req)) {
        return res.json(400, self.jsonError(err));
      }
      self.addFlashError(req, err);
      res.redirect(self.getBaseUrl(req, true));
    });
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
 * Handle Error from Read OP.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {string} view View to render.
 * @param {Error|string} err The error.
 * @private
 */
CrudCmd.prototype._handleReadError = function(req, res, view, err) {
  if (this.isJson(req)) {
    res.status(401).json(this.jsonError(err));
  } else {
    this.addError(res, err);
    res.render(view);
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
