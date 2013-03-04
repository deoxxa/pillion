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
