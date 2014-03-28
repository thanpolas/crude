# node-crude

Seamless CRUD control operations for node.

Currently works with Express and [Mongoose or Sequelize].

## Install

```shell
npm install crude --save
```

## Documentation

Still in alpha

### Stack

This package assumes you have the following stack:

* Mongoose
* Express
* connect-flash
* Jade


## Authors

* [@thanpolas][thanpolas]

## Release History

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
Copyright 2013 TalkSession

Licensed under the [MIT License](LICENSE-MIT)

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[Gruntfile]: https://github.com/gruntjs/grunt/wiki/Sample-Gruntfile "Grunt's Gruntfile.js"
[grunt-replace]: https://github.com/erickrdch/grunt-string-replace "Grunt string replace"
[grunt-S3]: https://github.com/pifantastic/grunt-s3 "grunt-s3 task"
[thanpolas]: https://github.com/thanpolas "Thanasis Polychronakis"
