/**
 * @fileOverview manage CRUD routes to an API endpoint
 */

var route = module.exports = {};

/**
 * The actual route add operation, decoupled from add to skip instanceof checks.
 *
 * @param {express} app The express instance.
 * @param {string} baseUrl The base URL to attach the routes.
 * @param {crude.Crude} crude an instance if crude.
 */
route.addRaw = function(app, baseUrl, crude) {
  app.get(baseUrl, crude.readList);
  app.post(baseUrl, crude.create);
  app.get(baseUrl + '/:id', crude.readOne);
  app.post(baseUrl + '/:id', crude.update);
  app.delete(baseUrl + '/:id', crude.delete);
};
