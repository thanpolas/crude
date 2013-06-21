/**
 * @fileOverview manage CRUD routes to an API endpoint
 */

var CrudCtrl = require('./controller-crud');

var route = module.exports = {};



/**
 * Create CRUD routes.
 *
 * @param {express} app The express instance.
 * @param {mongoose.Model} Model The mongoose model.
 * @param {string} baseUrl The base URL to attach the routes.
 * @param {crude.ControllerCrud=} optsCtrl an instance of crud controller.
 */
route.add = function(app, Model, baseUrl, optCtrl) {
  var crudCtrl;
  if (optCtrl instanceof CrudCtrl) {
    crudCtrl = optCtrl;
  } else {
    crudCtrl = new CrudCtrl(Model, baseUrl);
  }

  app.get(baseUrl, crudCtrl.readList);
  app.post(baseUrl, crudCtrl.create);
  app.get(baseUrl + '/add', crudCtrl.createView);
  app.get(baseUrl + '/:id', crudCtrl.readOne);
  app.post(baseUrl + '/:id', crudCtrl.update);
  app.get(baseUrl + '/:id/edit', crudCtrl.updateView);
  app.delete(baseUrl + '/:id', crudCtrl.delete);
};
