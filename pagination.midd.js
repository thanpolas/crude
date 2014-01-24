/**
 * @fileOverview Pagination Middleware.
 */

var url = require('url');

var __ = require('lodash');
var async = require('async');

var sanitize = require('validator').sanitize;
var pagination = require('pagination');

/**
 * The Pagination Middleware.
 *
 * @contructor
 */
var Pagination = module.exports = function(){

};


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
 * @param {Function(Error=)} next passing control to the next middleware.
 * @private
 */
Pagination.prototype._paginateMiddleware = function(opts, req, res, next) {

  var page = sanitize(req.query.page).toInt() || 1;
  var limit = sanitize(req.query.show).toInt() || opts.limit;
  var skip = (page - 1) * limit;
  var entity = new this.Entity(req.user);

  this.getLimitAndCount(opts.query, skip, limit, entity, function(err, items, count){
    if (err) {
      // TODO handle this better
      return next(err);
    }

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
  });
};


/**
 * Get a limited set of records and the total count.
 *
 * @param {?Object} query Narrow down the set, set to null for all.
 * @param {number} skip starting position.
 * @param {number} limit how many records to fetch.
 * @param {crude.Entity} entity an entity instance.
 * @param {Function(Error=, Array, number)} done Callback will contain an
 *   Array of mongoose documents and the total count.
 */
Pagination.prototype.getLimitAndCount = function(query, skip, limit, entity, done) {
  async.parallel([
    entity.readLimit.bind(entity, query, skip, limit),
    entity.count.bind(entity, null),
  ], function(err, res){
    if (err) {
      return done(err);
    }
    done(null, res[0], res[1]);
  });
};
