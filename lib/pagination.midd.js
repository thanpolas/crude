/**
 * @fileOverview Pagination Middleware.
 */

var __ = require('lodash');
var Promise = require('bluebird');
var inher = require('inher');
var url = require('url');

var sanitize = require('validator').sanitize;
var pagination = require('pagination');

/**
 * The Pagination Middleware.
 *
 * @contructor
 */
var Pagination = module.exports = inher.extend();

/**
 * Prepare and configure a pagination middleware.
 *
 * @param {crude.Entity} Entity The Entity class Ctor.
 * @param {Object=} optObj a hash with options.
 * @return {Function} The middleware.
 */
Pagination.prototype.paginate = function(Entity, optOpts) {
  var defaultOpts = {
    limit: 6,
    query: null,
  };
  var opts = __.extend(defaultOpts, optOpts || {});

  this.Entity = Entity;

  return this._paginateMiddleware.bind(this, opts);

};

/**
 * First Middleware
 *
 * @param {Object} opt a hash with options.
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 * @private
 */
Pagination.prototype._paginateMiddleware = Promise.method(function(opts, req, res) {

  var page = sanitize(req.query.page).toInt() || 1;
  var limit = sanitize(req.query.show).toInt() || opts.limit;
  var skip = (page - 1) * limit;
  var entity = this.Entity.getInstance();

  return this.getLimitAndCount(opts.query, skip, limit, entity)
    .then(function(results){
      var items = results[0];
      var count = results[1];
      if (!items || !__.isArray(items) || 0 === items.length) {
        // TODO handle this better
        throw new Error('no results');
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
    });
});


/**
 * Get a limited set of records and the total count.
 *
 * @param {?Object} query Narrow down the set, set to null for all.
 * @param {number} skip starting position.
 * @param {number} limit how many records to fetch.
 * @param {crude.Entity} entity an entity instance.
 *   Array of mongoose documents and the total count.
 * @return {Promise} A promise.
 */
Pagination.prototype.getLimitAndCount = function(query, skip, limit, entity) {
  return Promise.settle([
    entity.readLimit(query, skip, limit),
    entity.count(),
  ]);
};
