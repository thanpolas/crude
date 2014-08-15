/**
 * @fileOverview The Create of the CRUD ops.
 */
var Promise = require('bluebird');

var Controller = require('../controller-base');

/**
 * The Create of the CRUD ops.
 *
 * @param {app.ctrl.ControllerCrudBase} base DI The callee instance.
 * @constructor
 */
var Create = module.exports = Controller.extend(function(base) {
  /** @type {app.ctrl.ControllerCrudBase} Options */
  this.base = base;

});

/**
 * Handle new item creation
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 */
Create.prototype.create = Promise.method(function(req, res) {
  var rdrUrl = this.base.getBaseUrl(req) + '/add';
  var self = this;
  return this.base.controller.create(req.body)
    .then(function(doc) {
      var sanitizedDoc = self.base._sanitizeResult(doc);
      res.status(200).json(sanitizedDoc);
    })
    .catch(this.base._handleError.bind(this.base, req, res, rdrUrl));
});

