/**
 * @fileOverview manage CRUD routes to an API endpoint
 */

var CrudCtrl = require('./controller-crud');
var EntityCrud = require('./entity');

var route = module.exports = {};

/**
 * Create CRUD routes.
 *
 * @param {express} app The express instance.
 * @param {string} baseUrl The base URL to attach the routes.
 * @param {crude.Entity=} Entity an instance of the Entity class.
 */
route.add = function(app, baseUrl, Entity) {

  if (!(Entity instanceof EntityCrud)) {
    throw new Error('Entity argument not instance of crude.Entity');
  }

  var crudCtrl = new CrudCtrl(Entity, baseUrl);

  route.addRaw(app, baseUrl, crudCtrl);
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
