/**
 * @fileOverview The Create of the CRUD ops, a mixin.
 */
var cip = require('cip');
var Promise = require('bluebird');

/**
 * The Create of the CRUD ops.
 *
 * @constructor
 */
var Create = module.exports = cip.extend();

/**
 * Handle new item creation
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 * @protected
 */
Create.prototype._create = Promise.method(function(req, res) {
  return this.controller.create(req.body)
    .bind(this)
    .then(function(doc) {
      var sanitizedDoc = this._sanitizeResult(doc);
      res.status(200).json(sanitizedDoc);
    })
    .catch(this.mkErrorHandler(res, 'create'));
});
