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
  return this.base.entity.delete(query)
    .then(function() {
      if (self.base.isJson(req)) {
        return res.json(200);
      }
      self.base.addSuccess(res);
      res.redirect(self.base.getBaseUrl(req, true));
    }).catch(function(err) {
      if (self.base.isJson(req)) {
        return res.json(400, self.base.jsonError(err));
      }
      self.base.addFlashError(req, err);
      res.redirect(self.base.getBaseUrl(req, true));
    });
};
