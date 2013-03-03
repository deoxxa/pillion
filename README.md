Pillion
=======

Make your burro a bit more comfortable with RPC!

Overview
--------

Pillion is an RPC system that sits on top of object streams. It's designed to
be the potatoes to [burro](https://github.com/naomik/burro)'s meat, but will
actually work with any stream that allows you to send/receive arbitrary objects.

Everything is based around callbacks; you can pass a function in basically
anywhere. There are some tricky bits around managing lifecycles right now, but
that'll likely change in the future.

Installation
------------

Available via [npm](http://npmjs.org/):

> $ npm install pillion

Or via git:

> $ git clone git://github.com/deoxxa/pillion.git node_modules/pillion

Usage
-----

Also see [example.js](https://github.com/deoxxa/pillion/blob/master/example.js).

```javascript
var stream = require("stream");

var Pillion = require("./");

function createPair() {
  var r = [
    new stream.Duplex({objectMode: true}),
    new stream.Duplex({objectMode: true}),
  ];

  r[0]._read = function _read(n, respond) {};
  r[0]._write = function _write(input, done) {
    r[1].push(input);
    done();
  };

  r[1]._read = function _read(n, respond) {};
  r[1]._write = function _write(input, done) {
    r[0].push(input);
    done();
  };

  return r;
};

var s = createPair();

var p1 = new Pillion(),
    p2 = new Pillion();

p1.pipe(s[0]).pipe(p1);
p2.pipe(s[1]).pipe(p2);

p1.provide("reverse", function reverse(str, cb) {
  console.log("calling reverse with argument: " + str);

  cb(str.split("").reverse().join(""), function onOkay(thx) {
    console.log("got acked: " + thx);
  });
});

p2.call("reverse", "hello", function onReverse(str, kthx) {
  console.log("got response from reverse, result is: " + str);

  kthx("bye");
});
```

License
-------

3-clause BSD. A copy is included with the source.

Contact
-------

* GitHub ([deoxxa](http://github.com/deoxxa))
* Twitter ([@deoxxa](http://twitter.com/deoxxa))
* ADN ([@deoxxa](https://alpha.app.net/deoxxa))
* Email ([deoxxa@fknsrs.biz](mailto:deoxxa@fknsrs.biz))
