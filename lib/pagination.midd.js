/**
 * @fileOverview Pagination Middleware.
 */

var __ = require('lodash');
var Promise = require('bluebird');
var cip = require('cip');
var url = require('url');
var Link = require('httplink');

var pagination = require('pagination');

/**
 * The Pagination Middleware.
 *
 * @param {Object} Crude options.
 * @contructor
 */
var Pagination = module.exports = cip.extend(function(opts) {
  this.crudeOpts = opts;
});

/**
 * Prepare and configure a pagination middleware.
 *
 * @param {CrudBase} crude The Crude Base instance.
 * @param {Object=} optObj a hash with options.
 * @return {Function} The middleware.
 */
Pagination.prototype.paginate = function(crude, optOpts) {
  var defaultOpts = {
    limit: 6,
    query: null,
  };
  var opts = __.extend(optOpts || {}, defaultOpts);

  this.crude = crude;
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
  var queryShow = parseInt(req.query.show, 10);
  var page = parseInt(req.query.page, 10) || 1;
  var limit = queryShow || opts.limit;
  var skip = (page - 1) * limit;

  var query = opts.query;
  if (this.crude.opts.paginateQuery) {
    query = this.crude.opts.paginateQuery(req);
  }

  var self = this;
  return this.getLimitAndCount(query, skip, limit)
    .then(function(results) {
    var items = results[0];
    var count = results[1];

    if (!items || !__.isArray(items)) {
      items = [];
    }

    var paginator = pagination.create('search', {
      prelink: url.parse(req.url).pathname,
      current: page,
      rowsPerPage: limit,
      totalResult: count,
    });

    if (self.crude.isJson(req)) {
      var port = req.app.settings.port;
      var paginatorData = paginator.getPaginationData();

      var links = '<' + req.protocol + '://' + req.host;
      if (['80', '443'].indexOf(port + '') === -1) {
        links += ':' + port;
      }

      var link = new Link();
      var httplink = link.protocol(req.protocol)
        .data(paginatorData)
        .host(req.host)
        .port(port)
        .path(req.path)
        .rel('next')
        .show(queryShow)
        .next()
        .rel('last')
        .end()
        .get();
      res.set('Link', httplink);

      var cleanItems = self.crude.hidePrivatesArray(items);
      res.json(200, cleanItems);
      return next();
    }

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
  return Promise.all([
    this.crude.entity[this.crude.opts.entityReadLimit](query, skip, limit),
    this.crude.entity[this.crude.opts.entityCount](query),
  ]);
};
