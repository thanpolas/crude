/**
 * @fileOverview The Update of the CRUD ops, a mixin.
 */
var cip = require('cip');
var Promise = require('bluebird');
var appErr = require('nodeon-error');

var enums = require('../enums');

/**
 * The Update of the CRUD ops.
 *
 * @param {app.ctrl.ControllerCrudBase} base DI The callee instance.
 * @constructor
 */
var Update = module.exports = cip.extend();

/**
 * Handle item update.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @return {Promise} A promise.
 */
Update.prototype.update = Promise.method(function(req, res) {
  var itemId = req.body.id || req.params.id;
  if (!itemId) {
    var err = new appErr.Validation('No "id" field passed');
    this.handleError(req, res, enums.CrudOps.UPDATE,
      enums.CrudOps.HttpCode.UNAUTHORIZED, err);
    return;
  }

  var query = Object.create(null);

  query[this.opts.idField] = itemId;

  // force ownuser if it's set
  this._forceOwnUser(query, req);

  return this.controller.update(query, req.body)
    .bind(this)
    .then(this.controller.readOne.bind(null, query))
    .then(this.mkSuccessHandler(req, res, enums.CrudOps.UPDATE))
    .catch(this.mkErrorHandler(req, res, enums.CrudOps.UPDATE));
});

