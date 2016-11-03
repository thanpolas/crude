# Crude

Creates CRUD RESTfull endpoints for a given route.

[![Build Status](https://secure.travis-ci.org/thanpolas/crude.png?branch=master)](http://travis-ci.org/thanpolas/crude)

## Install

```shell
npm install crude --save
```

## Quick Start

Crude requires a controller with the following methods and signatures:

```js
var crude = require('crude');

var controller = {
    create: function(data) { return Promise(response); }),
    read: function(query) { return Promise(response); }),
    readLimit: function(query, skip, limit) { return Promise(response); }),
    readOne: function(query) { return Promise(response); }),
    update: function(query, data) { return Promise(response); }),
    count: function(query) { return Promise(response); }),
};

// Create the user CRUD routes
var userCrude = crude('/user', controller, expressApp);
```

That was it, you now have a RESTfull CRUD API under the route `/user`:

* POST `/user` Create a new user.
* GET `/user` Get a list of all the users paginated.
* GET `/user/:id` Get a single user item.
* PUT `/user/:id` Update the user item, expects the entirety of the resource to be updated.
* PATCH `/user/:id` Update the user item, expects a part of the resource to be updated.
* DELETE `/user/:id` Delete the user item.

HTTP methods were mapped based on [RFC7231 Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content: HTTP Method Definitions](http://tools.ietf.org/html/rfc7231#section-4.3).

## Documentation

[Find the complete API Documentation in the wiki](https://github.com/thanpolas/crude/wiki/Api).

### Stack

This package assumes you have the following stack:

* Express

## Release History

- **v1.0.0**, *03 Nov 2016*
    - Added the `maxPaginateLimit` option to cap allowed items per pagination.
- **v0.9.1**, *07 Sep 2015*
    - Added the `multiQueryAnd` option to allow for use of the `AND` operator in multiple items filter queries vs the default `OR`.
- **v0.9.0**, *03 Sep 2015*
    - No longer performs a "readOne" after an update operation, this can potentially be a breaking change for you.
- **v0.8.0**, *28 Jul 2015*
    - Will now return an HTTP Status 200 when no results for reading multiple records (used to return 404).
- **v0.7.5**, *23 Jul 2015*
    - Will now allow for GET queries with multiple items per attribute.
- **v0.7.4**, *09 Dec 2014*
    - Upgrade all dependencies to latest.
- **v0.7.3**, *24 Nov 2014*
    - Better heuristics for detected nodeON Error objects
- **v0.7.1**, *16 Sep 2014*
    - Switched CRUD middleware to FIFO.
    - Added [Query Middleware](https://github.com/thanpolas/crude/wiki/Api#query-middleware) on all CRUD OPs.
- **v0.7.0**, *14 Sep 2014*
    - Middleware are now of express type vs being Promises.
- **v0.6.3**, *11 Sep 2014*
    - Issue a HTTP Bad Request error code (400) by default vs Internal Error (500).
- **v0.6.2**, *11 Sep 2014*
    - Make config a synch method returning self.
- **v0.6.1**, *10 Sep 2014*
    - Changed HTTP Verbs for update to `PUT` and `PATCH`, thank you [@dmtrs](https://github.com/dmtrs).
- **v0.6.0**, *08 Sep 2014*
    - A complete refactor of the codebase and API has happened, documentation ready, time to hit the spotlight.
- **v0.5.13**, *01 Sep 2014*
    - Populates total item count for pagination query.
    - Express 4.0 compatible.
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

[View the rest of the changelog here](CHANGELOG.md).

## License

Copyright [Thanasis Polychronakis][thanpolas]

Licensed under the [MIT License](LICENSE-MIT)

[thanpolas]: https://github.com/thanpolas "Thanasis Polychronakis"
