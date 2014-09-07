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

That was it, you now have a RESTfull CRUD API under the route `/user`.

## Documentation

[Find the complete API Documentation in the wiki](https://github.com/thanpolas/crude/wiki/Api).

### Stack

This package assumes you have the following stack:

* Express

## Release History


- **v0.6.0**, *07 Sep 2014*
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

Copyright 2014 [Thanasis Polychronakis][thanpolas]

Licensed under the [MIT License](LICENSE-MIT)

[thanpolas]: https://github.com/thanpolas "Thanasis Polychronakis"
