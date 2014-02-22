/**
 * @fileOverview manage CRUD routes to an API endpoint
 */

var CrudCtrl = require('./controller-crud-export');

var route = module.exports = {};

/**
 * Create CRUD routes.
 *
 * @param {express} app The express instance.
 * @param {Entity} entity an instance of Entity.
 * @param {Object=} optOptions Optionally define a set of options.
 * @param {Crude} The crude controller.
 */
route.add = function(app, entity, optOptions) {
  var crudCtrl = new CrudCtrl();
  crudCtrl.setEntity(entity);
  crudCtrl.setOptions(optOptions);
  route.addRaw(app, crudCtrl.opts.baseUrl, crudCtrl);
  return crudCtrl;
};

/**
 * The actual route add operation, decoupled from add to skip instanceof checks.
 *
 * @param {express} app The express instance.
 * @param {string} baseUrl The base URL to attach the routes.
 * @param {crude.ControllerCrud} crudCtrl an instance implementind the CRUD ctrl.
 */
route.addRaw = function(app, baseUrl, crudCtrl) {
  app.get(baseUrl, crudCtrl.readList);
  app.post(baseUrl, crudCtrl.create);
  app.get(baseUrl + '/add', crudCtrl.createView);
  app.get(baseUrl + '/:id', crudCtrl.readOne);
  app.post(baseUrl + '/:id', crudCtrl.update);
  app.get(baseUrl + '/:id/edit', crudCtrl.updateView);
  app.delete(baseUrl + '/:id', crudCtrl.delete);
};
