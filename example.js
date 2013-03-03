#!/usr/bin/env node

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
