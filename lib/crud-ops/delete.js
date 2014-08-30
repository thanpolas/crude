/**
 * @fileOverview The Delete of the CRUD ops, a mixin.
 */
var cip = require('cip');
var Promise = require('bluebird');

/**
 * The Delete of the CRUD ops.
 *
 * @constructor
 */
var Delete = module.exports = cip.extend();

/**
 * Handle item deletion.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 * @protected
 */
Delete.prototype._delete = Promise.method(function(req, res){
  var query = new Object(null);
  query[this.opts.idField] = req.params.id;

  // force ownuser if it's set
  this._forceOwnUser(query, req);

  return this.controller.delete(query)
    .bind(this)
    .then(this.mkSuccessHandler(req, res, 'delete'))
    .catch(this.mkErrorHandler(req, res, 'delete'));
});
