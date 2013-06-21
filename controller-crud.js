/**
 * @fileOverview CRUD controller.
 */
var fs = require('fs');
var util = require('util');

var __ = require('lodash');
var jade = require('jade');

var Controller = require('./controller');

var PaginationMidd = require('./pagination.midd');

/**
 * The CRUD Controller
 *
 * @param {mongoose.Model} Model The mongoose model.
 * @param {string} baseUrl The base url.
 * @param {Object=} optOpts Optionally define options.
 * @contructor
 * @extends {crude.Controller}
 */
var CrudCtrl = module.exports = function(Model, baseUrl, optOpts){
  Controller.apply(this, arguments);

  this.Model = Model;
  this.baseUrl = baseUrl;
  var defaultOpts = {
    baseUrl: baseUrl,
    urlField: '_localUrl',
    nameField: 'name',
    idField: 'id',
    // A jade view
    layoutView: null,
  };
  this.opts = __.extend(defaultOpts, optOpts || {});

  // prep pagination
  var paginationMidd = new PaginationMidd();

  // define CRUD handlers
  this.create = [this._create.bind(this)];
  this.createView = [this._createView.bind(this)];
  this.readList = [
    paginationMidd.paginate(Model),
    this._readList.bind(this),
  ];
  this.readOne = [this._readOne.bind(this)];
  this.update = [this._update.bind(this)];
  this.updateView = [this._updateView.bind(this)];
  this.delete = [this._delete.bind(this)];

  // set default view template locations
  this.views = {
    add: __dirname + '/views/add.jade',
    view: __dirname + '/views/view.jade',
    list: __dirname + '/views/list.jade',
    edit: __dirname + '/views/edit.jade',
  };

  this.compiled = {};

  __.forOwn(this.views, function(tpl, key) {
    fs.readFile(tpl, function(err, data){
      if (err) {
        console.error('Error Reading file "' + tpl + '", error:', err);
        return;
      }
      this.compiled[key] = jade.compile(data, {
        filename: tpl
      });

    }.bind(this));
  }, this);
};
util.inherits(CrudCtrl, Controller);

/** @define {string} The view key in which the output will be available.  */
CrudCtrl.VIEW_OUTPUT_KEY = 'crudView';

/**
 * Handle new item creation
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCtrl.prototype._create = function(req, res) {
  var item = new this.Model(req.body);
  item.save(this._createCallback.bind(this, req, res));
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
  res.redirect(this.baseUrl + '/' + optDoc[this.opts.idField]);
};

/**
 * Handle item listing.
 *
 * @param {Object} req The request Object.
 * @param {Object} res The response Object.
 * @protected
 */
CrudCtrl.prototype._readList = function(req, res){
  res.render(this.views.list);
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
  var query = new Object(null);
  query[this.opts.urlField] = req.params.id;

  this.Model.findOne(query, function(err, doc){
    if (err) {
      this.addError(res, err);
      return res.render(this.views.view);
    }

    if (!doc) {
      var error = new Error('No results');
      this.addError(res, error);
      return res.render(this.views.view);
    }
    var viewVars = {
      item: doc,
      schema: this.Model.schema.paths,
      opts: this.opts,
    };

    if (this.opts.jadeLayout) {
      viewVars.layout = this.opts.jadeLayout;
    }

    res.locals[CrudCtrl.VIEW_OUTPUT_KEY] = this.compiled.view(viewVars);

    if (!this.opts.layoutView) {
      res.send(res.locals[CrudCtrl.VIEW_OUTPUT_KEY]);
    } else {
      res.render(this.opts.layoutView, viewVars);
    }
  }.bind(this));
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
      // log.fine('_update() :: Fetch item fail:', err.type, err.message);
      return res.redirect(req.header('Referer'));
    }

    var query = new Object(null);
    query[this.opts.idField] = req.params.id;
    this.Model.update(query, { $set: req.body },
      this._updateCallback.bind(this, req, res, doc));
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
    return res.redirect(this.baseUrl + doc._localUrl);
  }

  this.addSuccess(res);
  res.render(this.views.view, {item: doc});
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
  var query = new Object(null);
  query[this.opts.urlField] = req.params.localUrl;
  this.Model.findOne(query, function(err, data){
    if (err) {
      this.addError(res, err);
      return res.render(this.views.edit);
    }

    this.checkFlashError(req, res);
    res.render(this.views.edit, {item: data});
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
  this.checkFlashError(req);
  this.checkFlashSuccess(req);
  res.render(this.views.add);
};
