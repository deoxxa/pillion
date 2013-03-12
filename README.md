Pillion [![build status](https://travis-ci.org/deoxxa/pillion.png)](https://travis-ci.org/deoxxa/pillion)
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

Super Quickstart
----------------

If you just want to get your hands dirty, here's how I'd suggest doing it.
There's more detailed documentation down below, if you want it. This example
uses [burro](https://github.com/naomik/burro) and will probably only work in
node 0.9.9 or above.

```javascript
// server.js

var net = require("net"),
    burro = require("burro"),
    pillion = require("pillion");

var server = net.createServer(function(_socket) {
  var socket = burro.wrap(_socket),
      rpc = new pillion(socket);

  rpc.provide("greet", function(name, cb) {
    cb("hi there, " + name);
  });
});

server.listen(3000);
```

```javascript
// client.js

var net = require("net"),
    burro = require("burro"),
    pillion = require("pillion");

var _socket = net.connect(3000),
    socket = burro.wrap(_socket),
    rpc = new pillion(socket);

rpc.callRemote("greet", "friend", function(res) {
  console.log(res); // prints "hi there, friend"
});
```

Installation
------------

Available via [npm](http://npmjs.org/):

> $ npm install pillion

Or via git:

> $ git clone git://github.com/deoxxa/pillion.git node_modules/pillion

API
---

**constructor**

Constructs a new Pillion object, optionally piping to/from a supplied Duplex
stream and/or adding some methods.

```javascript
new Pillion([duplexStream], [methods]);
```

```javascript
// basic instantiation
var p = new Pillion();

// instantiation with a stream
var p = new Pillion(something.createDuplexStream());

// instantiation with method map
var p = new Pillion({
  hi: function(name, cb) { cb("hi there, " + name); },
  bye: function(name, cb) { cb("see you later, " + name); },
});

// instantiation with both
var p = new Pillion(something.createDuplexStream(), {
  hi: function(name, cb) { cb("hi there, " + name); },
  bye: function(name, cb) { cb("see you later, " + name); },
});
```

Arguments

* _duplexStream_ - an object implementing the streams2 "duplex stream" API. It
  must have the following functions defined: `read`, `write`, `pipe`, `unpipe`.
* _methods_ - a hash of name -> method pairs.

**provide**

Adds a method to the pillion object, making it available for remote peers to
call.

```javascript
pillion.provide(name, function);
```

```javascript
pillion.provide("hi", function(name, cb) {
  cb("hi there, " + name);
});
```

Arguments

* _name_ - a string used to identify the method.
* _function_ - a function that implements the method.

**callRemote**

Executes a remote method with semantics similar to `Function.call`.

```javascript
pillion.callRemote(name, [arg1, [arg2, ...]]);
```

```javascript
pillion.callRemote("hi", "honey bear", function(response) {
  // outputs "hi there, honey bear"
  console.log(response);
});
```

Arguments

* _name_ - name of the remote method.
* _argN_ - arguments for the remote method.

**applyRemote**

Executes a remote method with semantics similar to `Function.apply`.

```javascript
pillion.applyRemote(name, [args]);
```

```javascript
pillion.applyRemote("hi", ["honey bear", function(response) {
  // outputs "hi there, honey bear"
  console.log(response);
}]);
```

Arguments

* _name_ - name of the remote method.
* _args_ - an array of arguments for the remote method.

**bindRemote**

Returns a callable, portable reference to a remote method with semantics similar
to `Function.bind`.

```javascript
pillion.bindRemote(name, [arg1, [arg2, ...]]);
```

```javascript
var fn = pillion.bindRemote("hi");

fn("honey bear", function(response) {
  // outputs "hi there, honey bear"
  console.log(response);
}]);
```

Arguments

* _name_ - name of the remote method.
* _args_ - an array of arguments for the remote method.

**#methodAdded**

`methodAdded` is an event that's fired with the name of a method that has been
recently added to the remote peer.

```javascript
pillion.on("methodAdded", function(name) { ... });
```

```javascript
local.on("methodAdded", function(name) {
  console.log(name);
});
```

Parameters

* _name_ - name of the remote method.

**#methodRemoved**

`methodRemoved` is an event that's fired with the name of a method that has been
recently removed from the remote peer.

*Note that there is currently no public API for removing methods from a Pillion
object, so this will probably never be fired right now.*

```javascript
pillion.on("methodRemoved", function(name) { ... });
```

```javascript
local.on("methodRemoved", function(name) {
  console.log(name);
});
```

Parameters

* _name_ - name of the remote method.

Example
-------

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
  cb(str.split("").reverse().join(""), function onThanks(thx) {
    console.log("got thanks: " + thx);
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
alice.callRemote("reverse", "hello", function onReverse(str, kthx) {
  console.log("got response from reverse, result is: " + str);

  kthx("bye");
});
```

Output:

```
calling reverse with argument: hello
got response from reverse, result is: olleh
got thanks: bye
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
