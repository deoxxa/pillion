#!/usr/bin/env node

var stream = require("stream"),
    Pillion = require("./");

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
