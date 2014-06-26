/**
 * @fileOverview The Update of the CRUD ops.
 */
var path = require('path');

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
    if (self.base.isJson(req)) {
      res.status(400).json(self.base.jsonError(err));
    } else {
      res.status(400).send(err);
    }
  }
  var itemId = req.body.id || req.params.id;
  if (!itemId) {
    return validationError('No "id" field passed');
  }
  if (!this.base.opts.noViews && !this.base.opts.editView) {
    return validationError('Define "editView" parameter.');
  }
  var query = Object.create(null);

  query[this.base.opts.idField] = itemId;
  if (this.base.opts.ownUser) {
    query[this.base.opts.ownUserSchemaProperty] = req[this.base.opts.ownUserRequestProperty];
  }

  return this.base.entity.update(query, this.base.process(req.body))
    .then(this.base.entity.readOne.bind(this.base.entity, itemId))
    .then(this.base._handleSuccessRedirect.bind(this.base, req, res))
    .catch(this.base._handleErrorRedirect.bind(this.base, req, res,
      req.header('Referer')));
});

/**
 * Show single item update view
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 */
Update.prototype.updateView = Promise.method(function(req, res) {
  if (this.base.opts.noViews) {
    return res.status(401).json(this.base.jsonError('Wrong turn'));
  }

  if (!this.base.opts.editView) {
    var errMsg = 'Not implemented. Define "editView" parameter.';
    res.send(errMsg);
    throw new Error(errMsg);
  }

  var self = this;

  // attempt to fetch the record...
  var query = new Object(null);
  query[this.base.opts.urlField] = req.params.id;
  if (this.base.opts.ownUser) {
    query[this.base.opts.ownUserSchemaProperty] = req[this.base.opts.ownUserRequestProperty];
  }

  return this.base.entity.readOne(query).then(function(doc) {
    if (!doc) {
      throw new Error('Network not found, id: ' + req.params.id);
    }

    // assign the item to the tpl vars.
    res.locals.item = doc;
    // construct the item's url
    var itemUrl = path.join(self.base.getBaseUrl(req, true),
      doc[self.base.opts.urlField]);
    res.locals.opts.itemUrl = path.normalize(itemUrl) + '/';
    self.base.checkFlashError(req, res);
    res.render(self.base.opts.editView);
  }).catch(function(err) {
    self.base.addError(res, err);
    res.render(self.base.opts.editView);
    throw err;
  });
});
