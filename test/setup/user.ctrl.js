/**
 * @fileOverview User controller.
 */
var UserEntity = require('./user.ent');

var crude = require('../..');

/**
 * User controller.
 *
 * @contructor
 * @extends {crude}
 */
module.exports = crude.extendSingleton(function(){
  var opts = {
    baseUrl: '/user',
    idField: '_id',
    urlField: '_id',
    pagination: false,
    showId: true,
    noViews: true,
    dateField: 'birthdate'
  };

  this.setOptions(opts);
  this.setEntity(UserEntity.getInstance());
});
