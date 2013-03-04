#!/usr/bin/env node

var stream = require("stream");

var Pillion = require("./");

var stream1 = new stream.Duplex({objectMode: true}),
    stream2 = new stream.Duplex({objectMode: true});

stream1._read = function _read(n, respond) {};
stream1._write = function _write(input, done) {
  stream2.push(input);
  done();
};

stream2._read = function _read(n, respond) {};
stream2._write = function _write(input, done) {
  stream1.push(input);
  done();
};

var peer1 = new Pillion(stream1),
    peer2 = new Pillion(stream2);

peer1.provide("reverse", function reverse(str, cb) {
  console.log("calling reverse with argument: " + str);

  cb(str.split("").reverse().join(""), function onOkay(thx) {
    console.log("got acked: " + thx);
  });
});

peer2.call("reverse", "hello", function onReverse(str, kthx) {
  console.log("got response from reverse, result is: " + str);

  kthx("bye");
});
