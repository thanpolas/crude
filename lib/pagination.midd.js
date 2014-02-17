/**
 * @fileOverview Pagination Middleware.
 */

var __ = require('lodash');
var Promise = require('bluebird');
var cip = require('cip');
var url = require('url');

var sanitize = require('validator').sanitize;
var pagination = require('pagination');

/**
 * The Pagination Middleware.
 *
 * @contructor
 */
var Pagination = module.exports = cip.extend();

/**
 * Prepare and configure a pagination middleware.
 *
 * @param {Entity} entity An Entity instance
 * @param {Object=} optObj a hash with options.
 * @return {Function} The middleware.
 */
Pagination.prototype.paginate = function(entity, optOpts) {
  var defaultOpts = {
    limit: 6,
    query: null,
  };
  var opts = __.extend(defaultOpts, optOpts || {});

  this.entity = entity;

  return this._paginateMiddleware.bind(this, opts);
};

/**
 * First Middleware
 *
 * @param {Object} opt a hash with options.
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function(Error)} next Express callback.
 * @return {Promise} A promise.
 * @private
 */
Pagination.prototype._paginateMiddleware = Promise.method(function(opts, req,
  res, next) {

  var page = sanitize(req.query.page).toInt() || 1;
  var limit = sanitize(req.query.show).toInt() || opts.limit;
  var skip = (page - 1) * limit;

  return this.getLimitAndCount(opts.query, skip, limit)
    .then(function(results){
    var items = results[0];
    var count = results[1];
    if (!items || !__.isArray(items) || 0 === items.length) {
      // TODO handle this better
      return next('no results');
    }

    var paginator = pagination.create('search', {
      prelink: url.parse(req.url).pathname,
      current: page,
      rowsPerPage: limit,
      totalResult: count,
    });

    res.locals.pagination = paginator.render();
    res.locals.items = items;
    res.locals.count = count;
    next();
  }).catch(next);
});


/**
 * Get a limited set of records and the total count.
 *
 * @param {?Object} query Narrow down the set, set to null for all.
 * @param {number} skip starting position.
 * @param {number} limit how many records to fetch.
 * @return {Promise} A promise.
 */
Pagination.prototype.getLimitAndCount = function(query, skip, limit) {
  return Promise.settle([
    this.entity.readLimit(query, skip, limit),
    this.entity.count(),
  ]);
};
