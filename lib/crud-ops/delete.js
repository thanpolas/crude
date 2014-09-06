/**
 * @fileOverview The Delete of the CRUD ops, a mixin.
 */
var cip = require('cip');
var Promise = require('bluebird');

var enums = require('../enums');

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

  var self = this;
  return Promise.try(function() {
    return self.controller.delete(query);
  })
    .bind(this)
    .then(this.mkSuccessHandler(req, res, enums.CrudOps.DELETE))
    .catch(this.mkErrorHandler(req, res, enums.CrudOps.DELETE));
});
