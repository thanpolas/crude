/**
 * @fileOverview Template helpers.
 */

var tplHelpers = module.exports = {};

// View helpers
//

tplHelpers.getValue = function(item, schemaItem) {
  var paths = schemaItem.path.split('.');
  var val = item[paths.shift()];
  if (0 < paths.length) {
    paths.forEach(function(p){
      val = val[p];
    });
  }
  return val;
};

tplHelpers.getName = function(path) {
  var name = path.split('.').pop();
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Determine if this schema item should be publicly displayed.
 *
 * @param  {Object} schemaItem A single schema item (a column).
 * @return {boolean} true to show.
 */
tplHelpers.canShow = function(schemaItem) {
  if ('_' === schemaItem.path.charAt(0)) {
    return false;
  } else {
    return true;
  }
};