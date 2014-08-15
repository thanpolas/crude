/**
 * @fileOverview The Read of the CRUD ops.
 */
var Promise = require('bluebird');

var Controller = require('../controller-base');
var PaginationMidd = require('../pagination.midd');

/**
 * The Read of the CRUD ops.
 *
 * @param {app.ctrl.ControllerCrudBase} base DI The callee instance.
 * @constructor
 */
var Read = module.exports = Controller.extend(function(base) {
  /** @type {app.ctrl.ControllerCrudBase} Options */
  this.base = base;

  // prep pagination
  this.pagination = new PaginationMidd(this.base, this);
});

/**
 * Will force setup the readlist command middleware which depends on
 * consumer configuration.
 *
 */
Read.prototype.setupReadList = function() {
  if (this.base.opts.pagination) {
    this.base.readList.push(this.pagination.paginate());
  } else {
    this.base.readList.push(this.readList.bind(this));
  }
};

/**
 * Read all the items.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Read.prototype.readList = function(req, res) {
  var self = this;

  var query = this.parseParams(req);

  if (this.base.opts.ownUser) {
    query[this.base.opts.ownUserSchemaProperty] =
      req[this.base.opts.ownUserRequestProperty];
    // a falsy value (null/undefined) means user is not logged in
    if (!query[this.base.opts.ownUserSchemaProperty]) {
      this._handleReadError(req, res,
        new Error('Not Authed'));
      return;
    }
  }

  this.base.entity[this.base.opts.entityRead](query)
    .then(function(results) {
      var sanitizedDocs = self.base.hidePrivatesArray(results);
      res.status(200).json(sanitizedDocs);
    }).catch(this._handleReadError.bind(this, req, res));
};

/**
 * Handle a single item view.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 */
Read.prototype.readOne = Promise.method(function(req, res) {
  // attempt to fetch the record...
  var query = new Object(null);
  query[this.base.opts.urlField] = req.params.id;
  if (this.base.opts.ownUser) {
    query[this.base.opts.ownUserSchemaProperty] =
      req[this.base.opts.ownUserRequestProperty];
  }

  return this.base.entity[this.base.opts.entityReadOne](query)
    .then(this.base._handleSuccess.bind(this.base, req, res))
    .catch(this._handleReadError.bind(this, req, res));
});

/**
 * Handle Error from Read OP.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Error|string} err The error.
 * @private
 */
Read.prototype._handleReadError = function(req, res, err) {
  res.status(404).json(this.base.jsonError(err));
};

/**
 * Parses the request parameters (query string) and translates them into
 * query for the db.
 *
 * @param {express.Request} req The request object.
 * @return {Object} The query to use.
 */
Read.prototype.parseParams = function(req) {
  var query = {};
  if (!req.query) {
    return query;
  }

  var keys = Object.keys(req.query);
  if (!keys.length) {
    return query;
  }

  if (req.query.from) {
    if (req.query.to) {
      query[this.base.opts.dateField] = {between: [
        req.query.from,
        req.query.to,
      ]};
    } else {
      query[this.base.opts.dateField] = {gte: req.query.from};
    }
  } else if (req.query.to) {
    query[this.base.opts.dateField] = {lte: req.query.to};
  }

  var skipKeys = ['from', 'to', 'show', 'page'];

  keys.forEach(function(key) {
    if (skipKeys.indexOf(key) > -1) {
      return;
    }
    query[key] = req.query[key];
  });

  return query;
};
