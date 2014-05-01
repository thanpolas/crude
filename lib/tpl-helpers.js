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
 * Return the string with the first char capitalized.
 *
 * @param {string} name The string.
 * @return {string} Return the string with the first char capitalized.
 */
tplHelpers.capitaliseFirstChar = function(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

tplHelpers.formAttrs = function() {
  return {
    method: 'GET',
    action: 'zong'
  };
};
