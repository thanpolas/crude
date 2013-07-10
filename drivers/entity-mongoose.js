/**
 * @fileOverview The entities base class.
 */
var util = require('util');

var __ = require('lodash');
var Entity = require('../entity');

/**
 * The base Entity Class all entities extend from.
 *
 * @param {mongoose.Model} Model the model that this entity relates to.
 * @param {Object=} optUdo Optionally define the current handling user.
 * @constructor
 * @extends {crude.Entity}
 */
var Entity = module.exports = function(Model, optUdo) {
  Entity.call(this, Model, optUdo);
};
util.inherits(Entity, Entity);

/**
 * Create an entity item.
 *
 * @param {Object} itemData The data to use for creating.
 * @param {Function(ts.error.Abstract=, mongoose.Document=)} done callback.
 */
Entity.prototype.create = function(itemData, done) {
  var item = new this.Model(itemData);
  item.save(done);
};

/**
 * Read one entity item.
 *
 * @param {string|Object} id the item id or an Object to query against.
 * @param {Function(ts.error.Abstract=, mongoose.Document=)} done callback.
 */
Entity.prototype.readOne = function(id, done) {
  var query = new Object(null);

  if (__.isObject(id)) {
    query = id;
  } else {
    query.id = id;
  }

  this.Model.findOne(query, done);
};

/**
 * Read all items, do practice common sense!
 *
 * @param {Object=} optQuery Limit the results.
 * @param {Function(ts.error.Abstract=, mongoose.Document=)} done callback.
 */
Entity.prototype.read = function(optQuery, done) {
  var query = {};
  if (__.isFunction(optQuery)) {
    done = optQuery;
  } else if (__.isObject(optQuery)) {
    query = optQuery;
  }

  this.Model.find(query).exec(done);
};

/**
 * Read a limited set of items.
 *
 * @param {?Object} query Narrow down the set, set to null for all.
 * @param {number} skip starting position.
 * @param {number} limit how many records to fetch.
 * @param {Function(ts.error.Abstract=, Array.<mongoose.Document>=)} done callback.
 */
Entity.prototype.readLimit = function(query, skip, limit, done) {
  this.Model.find(query)
    .skip(skip)
    .limit(limit)
    .exec(done);
};

/**
 * Get the count of items.
 *
 * @param {?Object} query Narrow down the set, set to null for all.
 * @param {Function(ts.error.Abstract=, number=)} done callback.
 */
Entity.prototype.count = function(query, done) {
  this.Model.count(query).exec(done);
};

/**
 * Update an entity item.
 *
 * @param {string} id the item id.
 * @param {Object} itemData The data to use for creating.
 * @param {Function(ts.error.Abstract=, mongoose.Document=)} done callback.
 */
Entity.prototype.update = function(id, itemData, done) {
  this.Model.findById(id, function(err, doc){
    if (err) {
      return done(err);
    }

    __.forOwn(itemData, function(value, key) {
      doc[key] = value;
    }, this);

    doc.save(done);

  }.bind(this));
};

