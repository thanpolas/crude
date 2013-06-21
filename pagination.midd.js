/**
 * @fileOverview Pagination Middleware.
 */

var url = require('url');

var __ = require('lodash');
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
 * @param {mongoose.Model} Model The mongoose model.
 * @param {Object=} optObj a hash with options.
 * @return {Function} The middleware.
 */
Pagination.prototype.paginate = function(Model, optOpts) {

  var defaultOpts = {
    limit: 6,
    query: null,
  };
  var opts = __.extend(defaultOpts, optOpts || {});

  return this._paginateMiddleware.bind(this, Model, opts);

};

/**
 * First Middleware
 *
 * @param {mongoose.Model} Model The mongoose model.
 * @param {Object} opt a hash with options.
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Function(Error=)} next passing control to the next middleware.
 * @private
 */
Pagination.prototype._paginateMiddleware = function(Model, opts, req, res, next) {

  var page = sanitize(req.query.page).toInt() || 1;
  var limit = sanitize(req.query.show).toInt() || opts.limit;
  var skip = (page - 1) * limit;

  this.getLimitAndCount(Model, opts.query, skip, limit, function(err, items, count){
    if (err) {
      // TODO handle this better
      return next(err);
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
 * @param {mongoose.Model} Model The mongoose model.
 * @param {?Object} query Narrow down the set, set to null for all.
 * @param {number} skip starting position
 * @param {number} limit how many records to fetch.
 * @param {Function(Error=, Array, number)} done Callback will contain an
 *   Array of mongoose documents and the total count.
 */
Pagination.prototype.getLimitAndCount = function(Model, query, skip, limit, done) {
  Model.find()
    .skip(skip)
    .limit(limit)
    .exec(function(err, items){
      if (err) {
        return done(err);
      }

      Model.find().count().exec(function(err, count) {
        if (err) {
          return done(err);
        }
        done(null, items, count);
      });
    });
};
