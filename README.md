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
