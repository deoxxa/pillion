# TOC
   - [pillion](#pillion)
<a name=""></a>
 
<a name="pillion"></a>
# pillion
should allow calling a remote function.

```js
bob.provide("hello", function() {
  done();
});

alice.callRemote("hello");
```

should allow calling a remote function with arguments.

```js
bob.provide("hello", function(a, b, c) {
  assert(a === "x" && b === "y" && c === "z", "arguments were mangled");

  done();
});

alice.callRemote("hello", "x", "y", "z");
```

should allow applying a remote function.

```js
bob.provide("hello", function() {
  done();
});

alice.applyRemote("hello", []);
```

should allow applying a remote function with arguments.

```js
bob.provide("hello", function(a, b, c) {
  assert(a === "x" && b === "y" && c === "z", "arguments were mangled");

  done();
});

alice.applyRemote("hello", ["x", "y", "z"]);
```

should allow binding a remote function.

```js
bob.provide("hello", function() {
  done();
});

var fn = alice.bindRemote("hello");

fn();
```

should allow binding a remote function with all arguments.

```js
bob.provide("hello", function(a, b, c) {
  assert(a === "x" && b === "y" && c === "z", "arguments were mangled");

  done();
});

var fn = alice.bindRemote("hello", "x", "y", "z");

fn();
```

should allow binding a remote function with some arguments.

```js
bob.provide("hello", function(a, b, c) {
  assert(a === "x" && b === "y" && c === "z", "arguments were mangled");

  done();
});

var fn = alice.bindRemote("hello", "x", "y");

fn("z");
```

should allow calling a remote function with a callback.

```js
bob.provide("hello", function(cb) {
  cb();
});

alice.callRemote("hello", function() {
  done();
});
```

should allow calling a remote function with two callback levels.

```js
bob.provide("hello", function(cb) {
  cb(function() {
    done();
  });
});

alice.callRemote("hello", function(cb) {
  cb();
});
```

should emit methodAdded when a method is added to the remote peer.

```js
var expectedName = "testMethod";

alice.on("methodAdded", function(name) {
  assert(name === expectedName);

  done();
});

bob.provide(expectedName, function() {});
```

should emit methodRemoved when a method is removed from the remote peer.

```js
var expectedName = "testMethod";

alice.on("methodRemoved", function(name) {
  assert(name === expectedName);

  done();
});

bob.provide(expectedName, function() {});
bob._removeMethod(expectedName);
```

