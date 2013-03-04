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
var stream = require("stream"),
    Pillion = require("pillion");

// Set up the first peer, bob, which will be acting kind of like a "server"

var bobStream = new stream.Duplex({objectMode: true});

bobStream._read = function _read(n, respond) {};
bobStream._write = function _write(input, done) {
  aliceStream.push(input);
  done();
};

var bob = new Pillion(bobStream);

// Provide a "reverse" method that can be called by remote peers. It takes a
// string and a... callback?! You bet your ass it takes a callback! When we call
// that callback, it actually signals the other side (alice) to call whatever
// function is associated with it... Wild stuff.
bob.provide("reverse", function reverse(str, cb) {
  console.log("calling reverse with argument: " + str);

  // Okay, let's tell alice the result of our secret word-reversing algorithm.
  // We'll call her callback with the result and another callback that we want
  // her to call when she gets the response.
  cb(str.split("").reverse().join(""), function onOkay(thx) {
    console.log("got acked: " + thx);
  });
});

// Set up the second peer, alice, which will be taking a kind of "client" role

var aliceStream = new stream.Duplex({objectMode: true});

aliceStream._read = function _read(n, respond) {};
aliceStream._write = function _write(input, done) {
  bobStream.push(input);
  done();
};

var alice = new Pillion(aliceStream);

// Call the "reverse" method on bob. Give the arguments "hello" and... a
// callback! That's right, the remote side is going to call this callback on our
// side when it feels like it. Funky. Our callback gets the reversed string and
// ...ANOTHER CALLBACK?! WHAT THE HECK?! That's right, we're calling *another*
// callback on bob. CRAZY.
alice.call("reverse", "hello", function onReverse(str, kthx) {
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
