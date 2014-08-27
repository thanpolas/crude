/**
 * @fileOverview The Update of the CRUD ops, a mixin.
 */
var cip = require('cip');
var Promise = require('bluebird');

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
  var self = this;
  function validationError(err) {
    res.status(400).json(self.jsonError(err));
  }

  var itemId = req.body.id || req.params.id;
  if (!itemId) {
    return validationError('No "id" field passed');
  }

  var query = Object.create(null);

  query[this.opts.idField] = itemId;
  if (this.opts.ownUser) {
    query[this.opts.ownUserSchemaProperty] = req[this.opts.ownUserRequestProperty];
  }

  return this.controller.update(query, req.body)
    .bind(this)
    .then(this.controller.readOne.bind(null, query))
    .then(function(doc) {
      if (!doc) {
        res.status(404).json({});
        return;
      }

      var sanitizedDoc = this._sanitizeResult(doc);
      res.status(200).json(sanitizedDoc);
    })
    .catch(this.mkErrorHandler(res, 'update'));
});

