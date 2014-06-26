/**
 * @fileOverview A user model in mongoose.
 */
var Promise = require('bluebird');
var mongoose = require('mongoose');

/**
 * The base user model.
 *
 * @constructor
 */
var User = module.exports = function() {};

/**
 * The supported user roles.
 *
 * @enum {number}
 */
User.Role = {
  USER: 1,
  ADMIN: 2,
};

/** @define {string} default value for nulled passwords */
User.NULL_PASSWORD = 'null';

/**
 * Define the User schema
 * @type {Object}
 */
User.Schema = {
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  companyName: {type: String, default: ''},
  email: {type: String, required: true, trim: true, lowercase: true},
  password: {type: String, required: true},

  createdOn: {type: Date, default: Date.now},
  lastLogin: {type: Date, default: Date.now},
  lastIp: {type: String, default: ''},

  // Roles and access
  isVerified: {type: Boolean, required: true, default: false},
  isDisabled: {type: Boolean, required: true, default: false},
  isAdmin: {type: Boolean, required: true, default: false},
};

/**
 * Initialize the model.
 *
 * @return {Promise} A promise
 */
User.prototype.init = Promise.method(function() {
  this.schema = new mongoose.Schema(User.Schema);

  // define indexes
  this.schema.index({email: 1}, {unique: true});
  this.schema.index({createdOn: 1});

  // initialize model
  this.Model = mongoose.model('user', this.schema);
});
