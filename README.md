# node-crude

Seamless CRUD control operations for node.

[![Build Status](https://secure.travis-ci.org/thanpolas/crude.png?branch=master)](http://travis-ci.org/thanpolas/crude)


## Install

```shell
npm install crude --save
```

## Documentation

### <a name='TOC'>Table of Contents</a>

1. [API](#api)

```js
var crude = require('crude');

var domainCtrl = {
    create: function(data) { return Promise(response); }),
    read: function(query) { return Promise(response); }),
    readLimit: function(query, skip, limit) { return Promise(response); }),
    readOne: function(query) { return Promise(response); }),
    update: function(query, data) { return Promise(response); }),
    count: function(query) { return Promise(response); }),
};

var domainCrude = crude('/domain', domainCtrl);

// pass the express app to add routes.
domainCrude.addRoutes(app);

// returns the same instance.
var sameDomainCrude = crude('/domain');

// Middleware on each CRUD OP
domainCrude.create.use(function(req, res) { return Promise(); });
domainCrude.readOne.use(function(req, res) { return Promise(); });
domainCrude.readList.use(function(req, res) { return Promise(); });
domainCrude.update.use(function(req, res) { return Promise(); });
domainCrude.delete.use(function(req, res) { return Promise(); });

// Master Middleware, applies to all OPs
domainCrude.use(function(req, res) { return Promise();});

// Configure Crude, default values
domainCrude.config({
    // Map the ID visible in URLs to a DB attribute.
    idField: 'id',

    // Define this key so 'from' & 'to' params query the right attribute
    dateField: 'createdAt',

    // Set to true to check if user owns the item.
    ownUser: false,

    // required by "ownUser" the property in the request object that represents
    // the user id.
    ownUserRequestProperty: null,

    // required by "ownUser" the schema attribute that represents the user id.
    ownUserSchemaProperty: null,

    // Set to false to not paginate.
    pagination: true,

    // Callback to set the pagination query.
    paginateQuery: null,

    // Default item to limit to on pagination.
    paginateLimit: 6,
});

```

### <a name='hashVerify'>Verify a hashed string match</a>

> ### helpers.hashVerify(hash, text, done)
>
>    * **hash** `string` The hashed string.
>    * **text** `string` The string to test.
>    * **done** `Function(boolean)` Callback with a single argument, boolean.
>

Tests if the given string matches the provided hash.

**[[⬆]](#TOC)**

### Stack

This package assumes you have the following stack:

* Express

## Authors

* [@thanpolas][thanpolas]

## Release History

- **v0.5.12**, *06 Aug 2014*
    - No longer assume that `readLimit` OP result is an array.
    - Invoke the right methods when performing an update
- **v0.5.9**, *07 Jul 2014*
    - Pagination limit is now configurable via `opts.paginateLimit`.
- **v0.5.8**, *07 Jul 2014*
    - if ownUser flag is on then auth is required.
    - upgrade `req.host` to `req.hostname` in par with express 4.x
- **v0.5.7**, *04 Jul 2014*
    - Exclude `page` and `limit` query variables.
- **v0.5.6**, *04 Jul 2014*
    - Moved test facilities to their own repository.
- **v0.5.5**, *03 Jul 2014*
    - Don't expose the API Test Helper, it requires the whole testing stack, make a different package instead.
- **v0.5.3**, *03 Jul 2014*
    - Remove debug logging.
- **v0.5.2**, *01 Jul 2014*
    - Create and expose API Test Helper for easily testing API endpoints.
- **v0.5.1**, *26 Jun 2014*
    - author test for more complex queries using `between` by means of `from` / `to`.
- **v0.5.0**, *26 Jun 2014*
    - renamed option `noPagination` to `pagination`
    - Decoupled all CRUD ops to separate modules
    - Added query filtering options for Read OP
    - Added `dateField` option
- **v0.4.2**, *01 May 2014*
    - Check for `req.body.id` first, `req.params.id` second on update.
- **v0.4.1**, *24 Apr 2014*
    - Enable customizable entityCreate op.
- **v0.4.0**, *12 Apr 2014*
    - Added `ownUser` switch, will not enforce own user policy on CRUD ops.
    - More customization options.
    - Improved how errors are handled.
    - Bug fixes
- **v0.3.11**, *06 Apr 2014*
    - Create sanitizeResult option callback.
- **v0.3.10**, *28 Mar 2014*
    - Fix edit item bug for list view ONCE AND FOR ALL!!!! (ok maybe not).
- **v0.3.9**, *11 Mar 2014*
    - Fix list item link on default list view.
    - Allow Custom Labels for default views.
- **v0.3.7**, *04 Mar 2014*
    - Fix baseUrl() method for urls with no :id.
- **v0.3.6**, *27 Feb 2014*
    - Views piping fixes.
    - Make the entity methods configurable
    - honor excludePaths in item view
    - refactor how baseUrl is produced
    - rewire how update handles success
    - inject query callback on pagination
    - accept itemView and listView options
- **v0.3.5**, *23 Feb 2014*
    - Implement DELETE, about time.
- **v0.3.4**, *23 Feb 2014*
    - Fix symbol bug.
- **v0.3.3**, *23 Feb 2014*
    - JSON requests with pagination now get the `Link` HTTP header
    - Better handling of CRUD responses based on requested `accepts` header.
- **v0.3.2**, *22 Feb 2014*
    - Update router module to new API.
- **v0.3.1**, *22 Feb 2014*
    - Removed all args from ctor, introduced `setEntity()` and `setOptions`() methods.
- **v0.3.0**, *22 Feb 2014*
    - Changed constructor signature, now only accepts an Entity and optional options.
- **v0.2.3**, *19 Feb 2014*
    - Upgrade all dependencies to latest.
    - Perform a READ after an UPDATE.
    - Bug fixes.
- **v0.2.2**, *18 Feb 2014*
    - Bug fixes.
- **v0.2.1**, *17 Feb 2014*
    - Lazy instantiate Entities.
- **v0.2.0**, *17 Feb 2014*
    - Upgrade to 0.2.1 Entity and Cip packages.
- **v0.1.1**, *12 Feb 2014*
    - Now accepts both an instance and a constructor for Entity DI.
    - Ctor optimizations.
- **v0.1.0**, *12 Feb 2014* 
    - Updated to Entity 0.1.x
- **v0.0.12**, *10 Oct 2013* Bug fixes.
- **v0.0.11**, *10 Oct 2013* Entities moved to [their own repo](https://github.com/thanpolas/entity)
- **v0.0.3**, *15 Jul 2013*
    - Integrated [Middlewarify](https://github.com/thanpolas/middlewarify) and made all Entity primitive methods middleware.
    - Added Entity tests
- **v0.0.2**, *21 Jun 2013*
    - Big Bang

## License

Copyright 2014 Thanasis Polychronakis

Licensed under the [MIT License](LICENSE-MIT)

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[Gruntfile]: https://github.com/gruntjs/grunt/wiki/Sample-Gruntfile "Grunt's Gruntfile.js"
[grunt-replace]: https://github.com/erickrdch/grunt-string-replace "Grunt string replace"
[grunt-S3]: https://github.com/pifantastic/grunt-s3 "grunt-s3 task"
[thanpolas]: https://github.com/thanpolas "Thanasis Polychronakis"
