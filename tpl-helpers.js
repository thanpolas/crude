/**
 * @fileOverview Template helpers.
 *   Warning, every key exported here will be exposed on the global var 'fn' in
 *   the templates using the lodash 'extend' method.
 */

var tplHelpers = module.exports = {};

// View helpers
//

tplHelpers.getValue = function(item, schemaItem) {
  var paths = schemaItem.path.split('.');
  var val = item[paths.shift()];

  // mongoose may have nested objects, take care of that
  if (0 < paths.length) {
    paths.forEach(function(p){
      val = val[p];
    });
  }
  return val;
};

/**
 * Return a proper label for the path.
 *
 * @param {string} path The full path name.
 * @param {Object} opts The CRUD-controller options object.
 * @return {[type]}      [description]
 */
tplHelpers.getName = function(path, opts) {
  var name;
  if (opts.expandPaths) {
    name = path;
  } else {
    name = path.split('.').pop();
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Determine if this schema item should be publicly displayed.
 *
 * @param  {Object} schemaItem A single schema item (a column).
 * @param {Object} opts The CRUD-controller options object.
 * @return {boolean} true to show.
 */
tplHelpers.canShow = function(schemaItem, opts) {
  // check for custom excluded paths
  if (opts.viewExcludePaths.length) {
    if (0 <= opts.viewExcludePaths.indexOf(schemaItem.path)) {
      return false;
    }
  }

  // check for private vars (starting with underscore)
  if ('_' === schemaItem.path.charAt(0)) {
    if (opts.showId && '_id' === schemaItem.path) {
      return true;
    }
    return false;
  } else {
    return true;
  }
};

tplHelpers.formAttrs = function() {
  return {
    method: 'GET',
    action: 'zong'
  };
};