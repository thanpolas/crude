/**
 * @fileOverview The Read of the CRUD ops, a mixin.
 */
var cip = require('cip');
var Promise = require('bluebird');
var appErr = require('nodeon-error');

/**
 * The Read of the CRUD ops.
 *
 * @param {app.ctrl.ControllerCrudBase} base DI The callee instance.
 * @constructor
 */
var Read = module.exports = cip.extend();

/**
 * Controller for Read List, checks if pagination or read all.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A Promise.
 * @protected
 */
Read.prototype._readList = Promise.method(function(req, res) {
  if (this.opts.pagination) {
    return this.paginate(req, res);
  } else {
    return this._readListAll(req, res);
  }
});

/**
 * Reads and returns all the items.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A Promise.
 * @protected
 */
Read.prototype._readListAll = Promise.method(function(req, res) {
  var query = this.parseQueryParams(req);

  if (!this.checkOwnUser(query, req)) {
    var err = new appErr.Authentication('Not Allowed');
    this.handleError(req, res, 'read', err);
    return;
  }

  this.controller.read(query)
    .bind(this)
    .then(this.mkSuccessHandler(req, res, 'read'))
    .catch(this.mkErrorHandler(req, res, 'read'));
});

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
  query[this.opts.idField] = req.params.id;

  this._forceOwnUser(query, req);

  return this.controller.readOne(query)
    .bind(this)
    .then(this.mkSuccessHandler(req, res, 'readOne'))
    .catch(this.mkErrorHandler(req, res, 'readOne'));
});

/**
 * Parses the request parameters (query string) and translates them into
 * query for the db.
 *
 * @param {express.Request} req The request object.
 * @return {Object} The query to use.
 */
Read.prototype.parseQueryParams = function(req) {
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
      query[this.opts.dateField] = {between: [
        req.query.from,
        req.query.to,
      ]};
    } else {
      query[this.opts.dateField] = {gte: req.query.from};
    }
  } else if (req.query.to) {
    query[this.opts.dateField] = {lte: req.query.to};
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
