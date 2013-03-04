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
#!/usr/bin/env node

var stream = require("stream");

var Pillion = require("./");

var s1 = new stream.Duplex({objectMode: true}),
    s2 = new stream.Duplex({objectMode: true});

s1._read = function _read(n, respond) {};
s1._write = function _write(input, done) {
  s2.push(input);
  done();
};

s2._read = function _read(n, respond) {};
s2._write = function _write(input, done) {
  s1.push(input);
  done();
};

var p1 = new Pillion(s1),
    p2 = new Pillion(s2);

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

Output:

```
calling reverse with argument: hello
got response from reverse, result is: olleh
got acked: bye
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
