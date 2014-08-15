/**
 * @fileOverview The Delete of the CRUD ops.
 */
var Controller = require('../controller-base');

/**
 * The Delete of the CRUD ops.
 *
 * @param {app.ctrl.ControllerCrudBase} base DI The callee instance.
 * @constructor
 */
var Delete = module.exports = Controller.extend(function(base) {
  /** @type {app.ctrl.ControllerCrudBase} Options */
  this.base = base;

});

/**
 * Handle item deletion.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Delete.prototype.delete = function(req, res){
  var query = new Object(null);
  query[this.base.opts.urlField] = req.params.id;
  if (this.base.opts.ownUser) {
    query[this.base.opts.ownUserSchemaProperty] =
      req[this.base.opts.ownUserRequestProperty];
  }

  var self = this;
  return this.base.controller.delete(query)
    .then(function() {
      res.status(200).json();
    }).catch(function(err) {
      res.status(400).json(self.base.jsonError(err));
    });
};
