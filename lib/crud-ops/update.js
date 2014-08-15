/**
 * @fileOverview The Update of the CRUD ops.
 */
var Promise = require('bluebird');

var Controller = require('../controller-base');

/**
 * The Update of the CRUD ops.
 *
 * @param {app.ctrl.ControllerCrudBase} base DI The callee instance.
 * @constructor
 */
var Update = module.exports = Controller.extend(function(base) {
  /** @type {app.ctrl.ControllerCrudBase} Options */
  this.base = base;

});


/**
 * Handle item update.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 */
Update.prototype.update = Promise.method(function(req, res) {
  var self = this;
  function validationError(err) {
    res.status(400).json(self.base.jsonError(err));
  }

  var itemId = req.body.id || req.params.id;
  if (!itemId) {
    return validationError('No "id" field passed');
  }

  var query = Object.create(null);

  query[this.base.opts.idField] = itemId;
  if (this.base.opts.ownUser) {
    query[this.base.opts.ownUserSchemaProperty] = req[this.base.opts.ownUserRequestProperty];
  }

  return this.base.entity[this.base.opts.entityUpdate](query,
      this.base.process(req.body))
    .then(this.base.entity[this.base.opts.entityReadOne].bind(this.base.entity,
      itemId))
    .then(this.base._handleSuccess.bind(this.base, req, res))
    .catch(this.base._handleError.bind(this.base, req, res));
});

