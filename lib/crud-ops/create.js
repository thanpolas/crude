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
  return this.base.entity[this.base.opts.entityCreate](req.body)
    .then(function(doc) {
      if (self.base.isJson(req)) {
        var sanitizedDoc = self.base._sanitizeResult(doc);
        res.json(200, sanitizedDoc);
      } else {
        res.redirect(self.base.getBaseUrl(req) + '/' +
          doc[self.base.opts.urlField]);
      }
    })
    .catch(this.base._handleErrorRedirect.bind(this.base, req, res, rdrUrl));
});

/**
 * Create an item view.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Create.prototype.createView = function(req, res) {
  if (this.base.opts.noViews) {
    return res.status(401).json(this.base.jsonError('Wrong turn'));
  }
  this.base.checkFlashError(req, res);
  this.base.checkFlashSuccess(req, res);
  res.render(this.base.opts.editView);
};
