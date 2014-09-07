/**
 * @fileOverview Pagination OPs, a mixin.
 */

var __ = require('lodash');
var Promise = require('bluebird');
var cip = require('cip');
var url = require('url');
var Link = require('httplink');
var pagination = require('pagination');

var enums = require('../enums');

/**
 * The Pagination Operations.
 *
 * @contructor
 */
var Pagination = module.exports = cip.extend();

/**
 * Paginate
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 * @private
 */
Pagination.prototype.paginate = Promise.method(function(req, res) {

  var query = this._parsePaginationQuery(req);

  var pp = this._getPaginateParams(req);
  var items;
  return this.getLimitAndCount(query, pp.skip, pp.limit)
    .spread(function(results, count) {
      items = results;
      return count;
    })
    .then(this._getPaginatorData.bind(this, req))
    .then(this._setLinkData.bind(this, req, res))
    .then(function() {
      // closure required or items won't reference the right object.
      return items;
    })
    .then(this.mkSuccessHandler(req, res, enums.CrudOps.PAGINATE))
    .catch(this.mkErrorHandler(req, res, enums.CrudOps.PAGINATE));
});

/**
 * Get pagination parameters based on provided query options by the client.
 *
 * @param {Object} req The express request object.
 * @return {Object} Object containing keys:
 *    @param {number} limit  How many items to show.
 *    @param {number} page The current page.
 *    @param {number} skip How many records to skip on fetching.
 */
Pagination.prototype._getPaginateParams = function(req) {
  var limit = parseInt(req.query.show, 10) || this.opts.paginateLimit;
  var page = parseInt(req.query.page, 10) || 1;
  var skip = (page - 1) * limit;

  return {
    limit: limit,
    page: page,
    skip: skip,
  };
};

/**
 * Get Paginator Data based on results produced by getLimitAndCount().
 *
 * @param {Object} req The request Object.
 * @param {number} count The count.
 * @return {Promise} A promise.
 * @private
 */
Pagination.prototype._getPaginatorData = function(req, count) {
  var pp = this._getPaginateParams(req);

  var paginator = pagination.create('search', {
    prelink: url.parse(req.url).pathname,
    current: pp.page,
    rowsPerPage: pp.limit,
    totalResult: parseInt(count, 10),
  });

  return paginator.getPaginationData();
};

/**
 * Set Link data on the response.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Object} paginatorData Paginator data as produced by pagination lib.
 * @private
 */
Pagination.prototype._setLinkData = function(req, res, paginatorData) {

  var port = req.app.settings.port;
  var pp = this._getPaginateParams(req);

  var links = '<' + req.protocol + '://' + req.hostname;
  if (['80', '443'].indexOf(port + '') === -1) {
    links += ':' + port;
  }

  var link = new Link();
  var httplink = link.protocol(req.protocol)
    .data(paginatorData)
    .host(req.hostname)
    .port(port)
    .path(req.path)
    .rel('next')
    .show(pp.limit)
    .next()
    .rel('last')
    .end()
    .get();
  res.set('Link', httplink);
};

/**
 * Parse the incoming query options and produce a normalized query object.
 *
 * @param {Object} req The request Object.
 * @return {Object} The query to use.
 * @private
 */
Pagination.prototype._parsePaginationQuery = function(req) {
  var query = this.opts.query;

  if (typeof this.opts.paginateQuery === 'function') {
    query = this.opts.paginateQuery(req);
  }

  if (!__.isObject(query)) {
    query = {};
  }

  // augment query with possible request query params.
  __.extend(query, this.parseQueryParams(req));

  return query;
};

/**
 * Get a limited set of records and the total count.
 *
 * @param {?Object} query Narrow down the set, set to null for all.
 * @param {number} skip starting position.
 * @param {number} limit how many records to fetch.
 * @return {Promise} A promise.
 */
Pagination.prototype.getLimitAndCount = function(query, skip, limit) {
  var self = this;
  return Promise.all([
    Promise.try(function() {
      return self.controller.readLimit(query, skip, limit);
    }),
    Promise.try(function() {
      return self.controller.count(query);
    }),
  ]);
};
