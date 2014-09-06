/**
 * @fileOverview Project wide enumerations.
 */

var enums = module.exports = {};

/** @enum {string} The CRUD Ops types */
enums.CrudOps = {
  CREATE: 'create',
  READ: 'read',
  READ_ONE: 'readOne',
  PAGINATE: 'paginate',
  UPDATE: 'update',
  DELETE: 'delete',
};

/** @enum {number} HTTP Codes Used by CRUDE */
enums.HttpCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};
