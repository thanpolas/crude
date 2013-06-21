/**
 * @fileOverview CRUD controller.
 */

var util = require('util');

var Controller = require('./controller');

var PaginationMidd = require('../../middleware/pagination.midd');

/**
 * The CRUD Controller
 *
 * @param {mongoose.Model} Model The mongoose model.
 * @param {string} baseUrl The base url.
 * @contructor
 * @extends {crude.Controller}
 */
var CrudCtrl = module.exports = function(Model, baseUrl){
  Controller.apply(this, arguments);

  this.Model = Model;
  this.baseUrl = baseUrl;

  // prep pagination
  var paginationMidd = new PaginationMidd();

  // define CRUD handlers
  this.create = [this._create.bind(this)];
  this.createView = [this._createView.bind(this)];
  this.readList = [
    paginationMidd.paginate(Model),
    this._read.bind(this),
  ];
  this.readOne = [this._readOne.bind(this)];
  this.update = [this._update.bind(this)];
  this.updateView = [this._updateView.bind(this)];
  this.delete = [this._delete.bind(this)];

};
util.inherits(CrudCtrl, Controller);

/**
 * Handle new item creation
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCtrl.prototype._create = function(req, res) {
  var cust = new this.Model(req.body);
  cust.creatorId = req.user._id;

  cust.save(this._createCallback.bind(this, req, res));
};

/**
 * Handle a new item save, this is the CrudCtrl Model Save callback.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {Error=} err Operation failed.
 * @param {mongoose.Document} optDoc The saved document.
 * @protected
 */
CrudCtrl.prototype._createCallback = function(req, res, err, optDoc){
  if (err) {
    this.addFlashError(req);
    return res.redirect(this.baseUrl + '/add');
  }

  this.addFlashSuccess(req, optDoc);
  res.redirect(this.baseUrl + '/' + optDoc.id);
};

/**
 * Handle item listing.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCtrl.prototype._read = function(req, res){
  res.render('admin/customer/list');
};

/**
 * Handle a single item view.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCtrl.prototype._readOne = function(req, res){
  // attempt to fetch the record...
  this.Model.findOne({id: req.params.id}, function(err, doc){
    if (err) {
      this.addError(res, err);
      return res.render('admin/customer/view');
    }

    res.render('admin/customer/view', {cust: doc});
  });
};

/**
 * Handle item update.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCtrl.prototype._update = function(req, res) {
  // attempt to fetch the record...
  this.Model.findById(req.params.id, function(err, doc){
    if (err) {
      this.addFlashError(req, err);
      // log.fine('_update() :: Fetch customer fail:', err.type, err.message);
      return res.redirect(req.header('Referer'));
    }
    this.Model.update({ id: req.params.id },
      { $set: req.body }, this._updateCallback.bind(this, req, res, doc));
  }.bind(this));
};


/**
 * Handle an update callback, this is the Model Update callback.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @param {mongoose.Document} doc The mongoose document.
 * @param {Error=} err Operation failed.
 * @param {number=} optUpdateCount How many records were updated.
 * @protected
 */
CrudCtrl.prototype._updateCallback = function(req, res, doc, err, optUpdateCount){

  if (err) {
    this.addFlashError(req, err);
    // log.fine('_updateCallback() :: Edit item fail:', err.message);
    return res.redirect(req.header('Referer'));
  }

  if (1 !== optUpdateCount) {
    var error = new error.Database('No record was updated');
    error.count = optUpdateCount;
    this.addFlashError(req, error);
    // log.fine('_updateCallback() :: Fail, no record was updated. Update Count:', optUpdateCount);
    return res.redirect(req.header('Referer'));
  }

  if (doc._localUrl !== req.url) {
    // log.fine('_updateCallback() :: Changed url. Old:', req.url, 'New:', doc);
    this.addFlashSuccess();
    return res.redirect('/customer/' + doc._localUrl);
  }

  this.addSuccess(res);
  res.render('admin/customer/view', {cust: doc});
};

/**
 * Show single item update view
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCtrl.prototype._updateView = function(req, res) {
  // attempt to fetch the record...
  this.Model.findOne({_localUrl: req.params.localUrl}, function(err, data){
    if (err) {
      this.addError(res, err);
      return res.render('admin/customer/edit');
    }

    this.checkFlashError(req, res);
    res.render('admin/customer/edit', {cust: data});
  }.bind(this));
};


/**
 * Handle item deletion.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCtrl.prototype._delete = function(req, res){
  res.send('NOT IMPLEMENTED');
};


/**
 * Create an item view.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCtrl.prototype._createView = function(req, res){
  res.send('NOT YET');
};
