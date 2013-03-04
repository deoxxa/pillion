#!/usr/bin/env node

var stream = require("stream"),
    Pillion = require("./");

// Set up the first peer, which will be acting kind of like a "server"

var stream1 = new stream.Duplex({objectMode: true});

stream1._read = function _read(n, respond) {};
stream1._write = function _write(input, done) {
  stream2.push(input);
  done();
};

var peer1 = new Pillion(stream1);

peer1.provide("reverse", function reverse(str, cb) {
  console.log("calling reverse with argument: " + str);

  cb(str.split("").reverse().join(""), function onOkay(thx) {
    console.log("got acked: " + thx);
  });
});

// Set up the second peer, which will be taking a kind of "client" role

var stream2 = new stream.Duplex({objectMode: true});

stream2._read = function _read(n, respond) {};
stream2._write = function _write(input, done) {
  stream1.push(input);
  done();
};

var peer2 = new Pillion(stream2);

peer2.call("reverse", "hello", function onReverse(str, kthx) {
  console.log("got response from reverse, result is: " + str);

  kthx("bye");
});
