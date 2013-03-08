var stream = require("stream"),
    util = require("util");

function generateId() {
  return Date.now() + "_" + [0,0,0,0,0,0,0,0].map(function(e) { return Math.round(Math.random() * 9); }).join("");
}

var Pillion = module.exports = function Pillion(methods, backend) {
  stream.Duplex.call(this, {objectMode: true});

  this.methods = Object.create(null);

  if (typeof methods === "object" && typeof methods.read === "function" && typeof methods.write === "function" && typeof methods.pipe === "function" && typeof methods.unpipe === "function") {
    backend = methods;
    methods = null;
  }

  if (methods) {
    for (var k in methods) {
      this._addMethod(k, methods[k]);
    }
  }

  if (backend) {
    this.pipe(backend).pipe(this);
  }
};
util.inherits(Pillion, stream.Duplex);

Pillion.prototype._read = function _read(n, respond) {
};

Pillion.prototype._write = function _write(input, encoding, done) {
  if (input.type === "call") {
    if (!this.methods[input.method]) {
      this.push({
        type: "error",
        inResponseTo: input.id,
        error: "method `" + input.method + "' not found",
      });

      return;
    }

    var params = input.params.slice(0);
    input.functions.forEach(function(index) {
      params[index] = this.callRemote.bind(this, params[index].name);
    }.bind(this));

    var fn = this.methods[input.method].fn;
    if (this.methods[input.method].temporary) {
      delete this.methods[input.method];
    }

    fn.apply(null, params);
  } else if (input.type === "error") {
    this.emit("error", input);
  } else if (input.type === "methodAdded") {
    this.emit("methodAdded", input.name);
  } else if (input.type === "methodRemoved") {
    this.emit("methodRemoved", input.name);
  }

  done();
};

Pillion.prototype.provide = function provide(name, fn) {
  this._addMethod(name, fn);
};

Pillion.prototype._addMethod = function _addMethod(name, fn, temporary) {
  this.methods[name] = {
    fn: fn,
    temporary: !!temporary,
  };

  if (!temporary) {
    this.push({type: "methodAdded", name: name});
  }
};

Pillion.prototype._removeMethod = function _removeMethod(name) {
  if (!this.methods[name]) {
    return;
  }

  var temporary = !!this.methods[name].temporary;

  delete this.methods[name];

  if (!temporary) {
    this.push({type: "methodRemoved", name: name});
  }
};

Pillion.prototype.applyRemote = function applyRemote(method, params) {
  var id = generateId(),
      functions = [];

  var paramIndex = 0;
  params = params.map(function(param) {
    if (typeof param === "function") {
      var methodName = ["x", generateId()].join("_");

      this._addMethod(methodName, param, true);

      functions.push(paramIndex);

      param = {name: methodName};
    }

    paramIndex++;

    return param;
  }.bind(this));

  var req = {
    type: "call",
    id: id,
    method: method,
    params: params,
    functions: functions,
  };

  this.push(req);

  return req;
};

Pillion.prototype.callRemote = function callRemote(method) {
  var params = [].slice.call(arguments);

  // method, not needed
  params.shift();

  return this.applyRemote(method, params);
};

Pillion.prototype.bindRemote = function bindRemote(method) {
  return this.callRemote.bind.apply(this.callRemote, [this, method].concat([].slice.call(arguments, 1)));
};
