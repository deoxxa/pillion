var assert = require("assert"),
    stream = require("stream");

var Pillion = require("../index");

describe("pillion", function() {
  var bob, alice;

  beforeEach(function() {
    var bobStream = new stream.Duplex({objectMode: true});

    bobStream._read = function _read(n, respond) {};
    bobStream._write = function _write(input, done) {
      aliceStream.push(input);
      done();
    };

    bob = new Pillion(bobStream);

    var aliceStream = new stream.Duplex({objectMode: true});

    aliceStream._read = function _read(n, respond) {};
    aliceStream._write = function _write(input, done) {
      bobStream.push(input);
      done();
    };

    alice = new Pillion(aliceStream);
  });

  it("should allow calling a remote function", function(done) {
    bob.provide("hello", function() {
      done();
    });

    alice.callRemote("hello");
  });

  it("should allow calling a remote function with arguments", function(done) {
    bob.provide("hello", function(a, b, c) {
      assert(a === "x" && b === "y" && c === "z", "arguments were mangled");

      done();
    });

    alice.callRemote("hello", "x", "y", "z");
  });

  it("should allow applying a remote function", function(done) {
    bob.provide("hello", function() {
      done();
    });

    alice.applyRemote("hello", []);
  });

  it("should allow applying a remote function with arguments", function(done) {
    bob.provide("hello", function(a, b, c) {
      assert(a === "x" && b === "y" && c === "z", "arguments were mangled");

      done();
    });

    alice.applyRemote("hello", ["x", "y", "z"]);
  });

  it("should allow binding a remote function", function(done) {
    bob.provide("hello", function() {
      done();
    });

    var fn = alice.bindRemote("hello");

    fn();
  });

  it("should allow binding a remote function with all arguments", function(done) {
    bob.provide("hello", function(a, b, c) {
      assert(a === "x" && b === "y" && c === "z", "arguments were mangled");

      done();
    });

    var fn = alice.bindRemote("hello", "x", "y", "z");

    fn();
  });

  it("should allow binding a remote function with some arguments", function(done) {
    bob.provide("hello", function(a, b, c) {
      assert(a === "x" && b === "y" && c === "z", "arguments were mangled");

      done();
    });

    var fn = alice.bindRemote("hello", "x", "y");

    fn("z");
  });

  it("should allow calling a remote function with a callback", function(done) {
    bob.provide("hello", function(cb) {
      cb();
    });

    alice.callRemote("hello", function() {
      done();
    });
  });

  it("should allow calling a remote function with two callback levels", function(done) {
    bob.provide("hello", function(cb) {
      cb(function() {
        done();
      });
    });

    alice.callRemote("hello", function(cb) {
      cb();
    });
  });
});
