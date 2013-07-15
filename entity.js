/**
 * @fileOverview The Entity base class.
 */

var midd = require('middlewarify');

/**
 * The base Entity Class all entities extend from.
 *
 * @param {mongoose.Model} Model the model that this entity relates to.
 * @param {Object=} optUdo Optionally define the current handling user.
 * @constructor
 */
var Entity = module.exports = function(Model, optUdo) {
  /** @type {mongoose.Model} The mongoose model */
  this.Model = Model;

  /** @type {?Object} The current user or null for anonymous */
  this.udo = optUdo || null;

  // Create primitive middlewares
  midd.make(this, 'create', this._create);
  midd.make(this, 'read', this._read);
  midd.make(this, 'readOne', this._readOne);
  midd.make(this, 'readLimit', this._readLimit);
  midd.make(this, 'update', this._update);
  midd.make(this, 'delete  ', this._delete  );
  midd.make(this, 'count', this._count);
};

/**
 * Set the current user data object
 * @param {Object} udo A User Data Object.
 */
Entity.prototype.setUdo = function(udo) {
  this.udo = udo;
};

/**
 * Create an entity item.
 *
 * @param {Object} itemData The data to use for creating.
 * @param {Function(ts.error.Abstract=, mongoose.Document=)} done callback.
 * @protected
 */
Entity.prototype._create = function(itemData, done) {
  throw new Error('Not Implemented');
};

/**
 * Read one entity item.
 *
 * @param {string|Object} id the item id or an Object to query against.
 * @param {Function(ts.error.Abstract=, mongoose.Document=)} done callback.
 * @protected
 */
Entity.prototype._readOne = function(id, done) {
  throw new Error('Not Implemented');
};

/**
 * Read items based on query or if not defined, read all items. 
 * Do practice common sense!
 *
 * @param {Object|string=} optQuery Optionally define a query to limit results.
 * @param {Function(ts.error.Abstract=, mongoose.Document=)} done callback.
 * @protected
 */
Entity.prototype._read = function(optQuery, done) {
  throw new Error('Not Implemented');
};

/**
 * Read a limited set of items.
 *
 * @param {?Object} query Narrow down the set, set to null for all.
 * @param {number} skip starting position.
 * @param {number} limit how many records to fetch.
 * @param {Function(ts.error.Abstract=, Array.<mongoose.Document>=)} done callback.
 * @protected
 */
Entity.prototype._readLimit = function(query, skip, limit, done) {
  throw new Error('Not Implemented');
};

/**
 * Get the count of items.
 *
 * @param {?Object} query Narrow down the set, set to null for all.
 * @param {Function(ts.error.Abstract=, number=)} done callback.
 * @protected
 */
Entity.prototype._count = function(query, done) {
  throw new Error('Not Implemented');
};

/**
 * Update an entity item.
 *
 * @param {string} id the item id.
 * @param {Object} itemData The data to use for creating.
 * @param {Function(ts.error.Abstract=, mongoose.Document=)} done callback.
 * @protected
 */
Entity.prototype._update = function(id, itemData, done) {
  throw new Error('Not Implemented');
};

/**
 * Remove an entity item.
 *
 * @param {string} id the item id.
 * @param {Function(ts.error.Abstract=, mongoose.Document=)} done callback.
 * @protected
 */
Entity.prototype._delete = function(id, done) {
  throw new Error('Not Implemented');
};

