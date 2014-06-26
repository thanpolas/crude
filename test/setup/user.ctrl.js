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
    noPagination: true,
    showId: true,
    noViews: true,
  };

  this.setOptions(opts);
  this.setEntity(UserEntity.getInstance());
});
