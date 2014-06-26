/**
 * @fileOverview Users entity.
 */

var EntityCrudMongoose = require('node-entity').Mongoose;

var userModel = require('./user.mongoose.model').getInstance();

/**
 * The User entity.
 *
 * @constructor
 * @extends {Entity.Mongoose}
 */
var User = module.exports = EntityCrudMongoose.extendSingleton(function() {
  console.log('userEnt.ctor() :: Initializing...');
  this.setModel(userModel.Model);
});

/**
 * Create a UDO for public use by the UDO owner.
 *
 * @param  {Mongoose.Model} udo The raw udo.
 * @return {Object} A safe to use UDO.
 * @static
 */
User.secureOwnUdo = function(udoDocument) {
  var udo = Object.create(null);
  udo.id = udoDocument.id;
  udo.email = udoDocument.email;
  udo.name = udoDocument.name;
  udo.isVerified = udoDocument.isVerified;
  return udo;
};

/**
 * Create a UDO for public use by other users.
 *
 * @param  {Mongoose.Model} udo The raw udo.
 * @return {Object} A safe to use UDO.
 * @static
 */
User.securePublicUdo = function(udoDocument) {
  var udo = User.secureOwnUdo(udoDocument);
  delete udo.email;
  delete udo.isVerified;
  return udo;
};
