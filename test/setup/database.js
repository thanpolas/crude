/**
 * @fileOverview Will handle connectivity to the databases and alert on issues.
 */
var EventEmitter = require('events').EventEmitter;

var cip = require('cip');
var Promise = require('bluebird');
var mongoose = require('mongoose');

// models
var userModel = require('./user.mongoose.model').getInstance();

// var noop = function() {};

var CeventEmitter = cip.cast(EventEmitter);

/**
 * This module is an instance of EventEmitter.
 *
 * @event `open`: Emitted after we `connected` and `onOpen` is executed
 *   on all of this connections models.
 * @event `close`: Emitted after we `disconnected` and `onClose` executed
 *   on all of this connections models.
 * @event `error`: Emitted when an error occurs on this connection.
 * @constructor
 * @extends {events.EventEmitter}
 */
var Conn = module.exports = CeventEmitter.extendSingleton(function() {

  /** @type {boolean} In test mode use different connection settings */
  this._testMode = false;

  /** @type {boolean} Indicates if inited and event handlers added to libs */
  this._initialized = false;

  /**
   * Reference for the mongo reconnect setTimeout index or null.
   * @type {?setTimeout}
   * @private
   */
  this._mongoReconnTimer = null;

  /** @type {?mongoose.connect} The mongoose connection object */
  this.db = null;
});

/**
 * Mongo ready states.
 *
 * @type {number}
 */
Conn.MongoState = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  CONNECTING: 2,
  DISCONNECTING: 3
};

/**
 * Initiate the connections with the db.
 *
 * This method should only be called once.
 *
 * @return {Promise} a promise.
 */
Conn.prototype.init = Promise.method(function() {
  if (this._initialized) { return; }
  this._initialized = true;

  // setup global mongoose event handlers
  mongoose.connection.on('open', this._onOpen.bind(this));
  mongoose.connection.on('close', this._onClose.bind(this));
  mongoose.connection.on('error', this._onError.bind(this));

  return this._connectMongo()
    .then(this._initModels.bind(this));
});

/**
 * Initialize all the models.
 *
 * @return {Promise} A promise.
 * @private
 */
Conn.prototype._initModels = function() {
  return Promise.all([
    userModel.init(),
  ]);
};

/**
 * Create a connection with mongo.
 *
 * @return {Promise} A promise.
 * @private
 */
Conn.prototype._connectMongo = function() {
  var self = this;
  return new Promise(function(resolve, reject) {

    // force clear reconn timers
    clearTimeout(self._mongoReconnTimer);
    self._mongoReconnTimer = null;

    // check if already connected
    if (mongoose.connection.readyState === Conn.MongoState.CONNECTED) {
      return resolve();
    }

    // http://mongoosejs.com/docs/connections.html
    var mongoUri = self.getMongoUri();
    var mongoOpts = {
      server: {
        socketOptions: {
          keepAlive: 1
        }
      }
    };

    mongoose.connect(mongoUri, mongoOpts);
    var db = self.db = mongoose.connection.db;

    // rather silly callback mechanism.
    var cbDone = false;
    function onErrorLocal(err) {
      if (cbDone) {return;}
      cbDone = true;
      db.removeListener('open', onOpenLocal);
      reject(err);
    }
    function onOpenLocal() {
      if (cbDone) {return;}
      cbDone = true;
      db.removeListener('error', onErrorLocal);
      resolve();
    }

    mongoose.connection.once('error', onErrorLocal);
    mongoose.connection.once('open', onOpenLocal);
  });
};

/**
 * Close connection to Mongo db.
 *
 * @return {Promise} A promise.
 */
Conn.prototype.closeMongo = function() {
  return new Promise(function(resolve, reject) {
    mongoose.connection.close(function(err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

/**
 * re-start a mongo connection, will close connection first.
 *
 * @return {Promise} A promise.
 */
Conn.prototype.openMongo = Promise.method(function() {
  return this.closeMongo()
    .then(this._connectMongo().bind(this));
});

/**
 * Returns the proper mongo uri to use for connecting.
 *
 * @return {string} the uri.
 */
Conn.prototype.getMongoUri = function() {
  return 'mongodb://localhost/crude';
};

/**
 * Handle mongoose `open` events.
 * @private
 */
Conn.prototype._onOpen = function() {
  if (this._mongoReconnTimer) {
    clearTimeout(this._mongoReconnTimer);
    this._mongoReconnTimer = null;
  }

  this.emit('open');
};

/**
 * Handle mongoose `close` events.
 * @private
 */
Conn.prototype._onClose = function() {
  // force
  mongoose.connection.readyState = Conn.MongoState.DISCONNECTED;

  // clear connection
  this.db.close();

  // Attempt to reconnect in x time.
  var reconnTime = 500;
  if (!this._mongoReconnTimer) {
    this._mongoReconnTimer = setTimeout(this._connectMongo.bind(this), reconnTime);
  }

  this.emit('close');
};

/**
 * Handle mongoose `error` events.
 *
 * @param {Error} err Mongoose error.
 * @private
 */
Conn.prototype._onError = function(err) {
  this.emit('error', err);
};

