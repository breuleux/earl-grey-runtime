
"use strict";

if (typeof(global) === "undefined")
    global = window;

// SYMBOLS

Symbol.check = "::check"
Symbol.project = "::project"
Symbol.projectNoExc = ":::project"
Symbol.clone = "::clone"
Symbol.send = "::send"
Symbol.contains = "::contains"
Symbol.repr = "::repr"


// EXTENSIONS TO STANDARD OBJECTS

String["::check"] = function (value) {
    return typeof(value) === "string";
};

String[":::project"] = function (value) {
    return [true, String(value)]
};

Number["::check"] = function (value) {
    return typeof(value) === "number";
};

Number[":::project"] = function (value) {
    return [true, parseFloat(value)]
};

Boolean["::check"] = function (value) {
    return typeof(value) === "boolean";
};

Boolean[":::project"] = function (value) {
    return [true, Boolean(value)]
};

Array["::check"] = function (value) {
    return this.isArray(value);
};

Array[":::project"] = function (value) {
    if (value instanceof Array)
        return [true, value]
    else
        return [true, [value]]
};


var _number_methods = {
    "::repr": function(_repr) {
        return ENode([".num"], {}, [this]);
    }
};

var _string_methods = {
    "::contains": function(x) {
        return this.includes(x);
    },
    "::repr": function(_repr) {
        return ENode([".str"], {}, [this]);
    }
};

var _boolean_methods = {
    "::repr": function(_repr) {
        return ENode([".bool", "." + String(this)], {}, [this]);
    }
};

var _object_methods = {
    "::repr": function(_repr) {
        var it = items(this);
        function mktable() {
            var ch = [];
            for (var i = 0; i < it.length; i++) {
                var curr = it[i];
                ch.push(ENode([".assoc"], {}, [_repr(curr[0]), _repr(curr[1])]));
            }
            return ENode([".object"], {}, ch);
        }
        if (this["::egclass"]) {
            return ENode([".class"], {}, [
                ENode([".name"], {}, [this["::name"]]),
                mktable()
            ]);
        }
        if (this.constructor && this.constructor["::egclass"]) {
            return ENode([".instance"], {}, [
                ENode([".name"], {}, [this.constructor["::name"]]),
                mktable()
            ]);
        }
        return mktable();
    }
};

var _array_methods = {
    "::check": function (value) {
        if (value instanceof Array) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] !== value[i])
                    return false;
            }
            return true;
        }
        else {
            return false;
        }
    },
    "::clone": function (value) {
        return mergeInplace(this.slice(0), this);
    },
    ":::project": function (value) {
        if (value instanceof Array) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] !== value[i])
                    return [true, this.concat([value])];
            }
            return [true, value];
        }
        else {
            return [true, this.concat([value])];
        }
    },
    "::serialize_ast": function () {
        return ["array"].concat(this.map(_serialize_ast));
    },
    "::contains": function (b) {
        return this.indexOf(b) !== -1;
    },
    "::repr": function (_repr) {
        return ENode([".array"], {}, this.map(function (x) {return _repr(x); }));
    },
    "ejoin": function (sep) {
        return ENode([], {}, this.map(function (x) { return repr(x); })).join(sep);
    }

    // "::send": function (x) {
    //     if (x instanceof range) {
    //         return this.slice(x.start, x.end);
    //     }
    //     else {
    //         throw Error("Array does not recognize message: " + x);
    //     }
    // }
};

var _re_methods = {
    "::check": function (value) {
        if (typeof(value) === "string")
            return value.match(this) ? true : false;
        else
            return false;
    },
    ":::project": function (value) {
        if (typeof(value) === "string") {
            var m = value.match(this);
            if (m === null)
                return [false, null];
            else
                return [true, m];
        }
        else
            return [false, null];
    },
    "::contains": function(x) {
        return typeof(x) === "string" && this.test(x);
    }
};

var _function_methods = {
    "::repr": function(_repr) {
        if (this["::egclass"]) {
            return Object.prototype["::repr"].call(this, _repr);
        }
        else {
            return ENode([".function"], {}, [this.name || "<anonymous>"]);
        }
    },
    "::send": function(args) {
        return this.apply(this, args);
    }
};

[[Number, _number_methods],
 [String, _string_methods],
 [Boolean, _boolean_methods],
 [Array, _array_methods],
 [RegExp, _re_methods],
 [Function, _function_methods],
 [Object, _object_methods]].map(function (nm) {
     items(nm[1]).map(function (kv) {
         if (!nm[0].prototype[kv[0]])
             Object.defineProperty(nm[0].prototype, kv[0], {
                 enumerate: false,
                 value: kv[1],
                 writable: true
             });
     });
 });


// EG GLOBAL FUNCTIONS

// INTERNAL

function ___build_array(arrays) {
    return arrays.reduce(function (x, y) { return x.concat(y); }, []);
}
global["___build_array"] = ___build_array;

function ___hasprop(obj, key) {
    if (obj === null || obj === undefined)
        return false;
    else if (typeof(obj) === "string")
        return key in String.prototype;
    else if (typeof(obj) === "number")
        return key in Number.prototype;
    else if (typeof(obj) === "boolean")
        return key in Boolean.prototype;
    else
        return key in obj;
}
global["___hasprop"] = ___hasprop;

function ___serialize_ast(x) {
    if (typeof(x) === "object" && x !== null)
        return x["::serialize_ast"]();
    else
        return ["value", x];
}
global["___serialize_ast"] = ___serialize_ast;

function ___match_error(value, url, start, end) {
    var err = ErrorFactory("match").createFrom(
        ___match_error,
        "Could not find a match for value",
        {value: value});
    if (url)
        err.location = ["location", url, start, end]
    throw err;
}
global["___match_error"] = ___match_error;

function ___extend(child, parent) {
    items(parents).forEach(function (kv) {
        child[kv[0]] = kv[1];
    });
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
    child["::super"] = parent.prototype;
    return child;
}
global["___extend"] = ___extend;



// USER FUNCTIONS

function send(obj, msg) {
    var t = typeof(msg);
    if (t === "string" || t === "number" || t === "symbol")
        return obj[msg];
    else if (msg instanceof range)
        return obj.slice(msg.start, msg.end + 1);
    else if (t === "object" && (obj instanceof Object && obj["::send"]))
        return obj["::send"](msg);
    else
        throw Error(obj + " cannot receive message '" + msg + "'");
}
global["send"] = send;


function object(pairs) {
    var rval = {};
    if (pairs.length === undefined)
        throw ErrorFactory("object").create(
            "Argument to 'object' must be an array of pairs.");
    for (var i = 0; i < pairs.length; i++) {
        var p = pairs[i];
        if (!p || !(p.length === 2))
            throw ErrorFactory("object").create(
                "Argument to 'object' must be an array of pairs.");
        rval[p[0]] = p[1];
    }
    return rval;
}
global["object"] = object;


global["keys"] = Object.keys;


function items(obj) {
    var rval = [];
    for (var k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            rval.push([k, obj[k]]);
        }
    }
    return rval;
}
global["items"] = items;


// function values(obj) {
//     var rval = [];
//     for (var k in obj) {
//         if (Object.prototype.hasOwnProperty.call(obj, k)) {
//             rval.push(obj[k]);
//         }
//     }
//     return rval;
// }
// global["values"] = values;


function enumerate(arr) {
    var results = [];
    for (var i = 0; i < arr.length; i++) {
        results.push([i, arr[i]]);
    }
    return results;
}
global["enumerate"] = enumerate;


function zip() {
    var r = [];
    for (var i = 0; i < arguments[0].length; i++) {
        var x = [];
        for (var j = 0; j < arguments.length; j++) {
            x.push(arguments[j][i]);
        }
        r.push(x);
    }
    return r;
}
global["zip"] = zip;


function product(a, b) {
    var results = [];
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < b.length; j++) {
            results.push([a[i], b[j]]);
        }
    }
    return results;
}
global["product"] = product;


function neighbours(arr, n) {
    n = n || 2;
    var r = [];
    for (var i = 0; i <= arr.length - n; i++) {
        r.push(arr.slice(i, i + n));
    }
    return r;
}
global["neighbours"] = neighbours;


function predicate(f) {
    f["::check"] = f;
    return f;
}
global["predicate"] = predicate;


function equal(a, b) {
    if (a === b)
        return true;
    else if (typeof(a) === "number"
             || typeof(a) === "string"
             || typeof(a) === "boolean"
             || a === null || a === undefined)
        return false;
    else if (a instanceof Array) {
        if (!(b instanceof Array) || a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; i++) {
            if (!equal(a[i], b[i]))
                return false;
        }
        return true;
    }
    else if (Object.getPrototypeOf(a) === Object.prototype
             && b !== undefined && typeof(b) === "object"
             && Object.getPrototypeOf(b) === Object.prototype) {
        var ka = Object.keys(a);
        if (!equal(ka.sort(), Object.keys(b).sort()))
            return false;
        for (var key in a) {
            if (!equal(a[key], b[key]))
                return false;
        }
        return true;
    }
    else if (typeof(a) === "object" && a["::serialize"]) {
        if (b !== undefined && typeof(b) === "object" && b["::serialize"]) {
            return equal(a["::serialize"](), b["::serialize"]());
        }
    }
    else {
        return false;
    }
}
global["__equal____equal__"] = equal;
global["equal"] = equal;


function nequal(a, b) {
    return !equal(a, b);
}
global["__bang____equal__"] = nequal;
global["nequal"] = nequal;


function contains(a, b) {
    return a["::contains"](b);
}
global["__in__"] = function(a, b) { return contains(b, a); };
global["contains"] = contains;


function repr(x, _repr) {
    if (!_repr) _repr = repr;
    if (x === null || x === undefined) {
        return ENode(["." + String(x)], {}, [String(x)]);
    }
    if (x["::repr"]) {
        return x["::repr"](_repr);
    }
    else {
        return String(x);
    }
}
global["repr"] = repr;


function mergeInplace(dest, values) {
    for (var k in values) {
        if (values.hasOwnProperty(k))
            dest[k] = values[k];
    }
    return dest;
}
global["__amp____colon__"] = mergeInplace;


function merge(a, b) {
    var x = clone(a);
    return mergeInplace(x, b);
}
global["__amp__"] = merge;


function clone(a) {
    if (a === undefined || a === null
        || typeof(a) === "number"
        || typeof(a) === "string"
        || typeof(a) === "boolean")
        return a
    if (typeof(a) === "object" && a["::clone"])
        return a["::clone"]();
    if (Object.getPrototypeOf(a) === Object.prototype) {
        var dest = {};
        for (var key in a) {
            if (Object.prototype.hasOwnProperty.call(a, key))
                dest[key] = a[key];
        }
        return dest;
    }
    throw ErrorFactory("clone").create("Object cannot be cloned");
}
global["clone"] = clone;


function range(from, to) {
    if (!(this instanceof range))
        return new range(from, to)
    this.start = from
    this.end = to
}
range["::egclass"] = true;
range["::name"] = "range";
range.prototype[Symbol.iterator] = function () {
    var self = this;
    var current = self.start;
    return {
        next: function () {
            if (current >= self.end + 1)
                return {value: undefined, done: true}
            else {
                var rval = {value: current, done: false}
                current++;
                return rval;
            }
        }
    }
};
range.prototype.toArray = function () {
    var res = [];
    for (var i = this.start; i <= this.end; i++) {
        res.push(i);
    }
    return res;
};
range.prototype["::check"] = function (x) {
    return x >= this.start && x <= this.end;
};

global["range"] = range;


function dir(arg) {
    function helper(arg) {
        if (typeof(arg) === "number")
            return helper(Number.prototype);
        else if (typeof(arg) === "string")
            return helper(String.prototype);
        else if (arg === true || arg === false)
            return helper(Boolean.prototype);
        else {
            var curr = arg;
            var results = [];
            while (curr && (arg === Object || curr !== Object)) {
                var props = Object.getOwnPropertyNames(curr);
                for (var i = 0; i < props.length; i++) {
                    var k = props[i];
                    if (!k.match(/^toString|^__|^::/))
                        results.push([k, arg[k]]);
                }
                curr = Object.getPrototypeOf(curr);
            }
            return object(results.sort());
        }
    }
    return helper(arg);
}
global["dir"] = dir;


function getChecker(type) {
    var f = type["::check"];
    if (f === undefined) {
        return function (value) {
            return value instanceof type;
        };
    }
    else {
        return function (value) {
            return f.call(type, value);
        };
    }
}
global["getChecker"] = getChecker;


function getProjector(type) {
    var f = type[":::project"];
    if (f === undefined) {
        f = type["::project"];
        if (f === undefined) {
            return function(value) {
                return [true, type(value)];
            };
        }
        else {
            return function(value) {
                try {
                    return [true, f.call(type, value)];
                }
                catch (_) {
                    return [false, null];
                }
            };
        }
    }
    else {
        return f.bind(type);
    }
}
global["getProjector"] = getProjector;



function consume(gen, n) {
    if (n === null || n === undefined)
        n = Infinity;
    if (!gen || !gen.next || n <= 0) {
        if (!Array.isArray(gen) && gen[Symbol.iterator]) {
            var res = [];
            var it = gen[Symbol.iterator]();
            var curr = it.next();
            var i = 0;
            for (var i = 0; !curr.done && i < n; i++) {
                res.push(curr.value);
                curr = it.next();
            }
            return res;
        }
        return gen;
    }
    var curr = gen.next();
    var results = [];
    var i = 0;
    while (!curr.done && i < n) {
        results.push(curr.value);
        curr = gen.next();
        i++;
    }
    return results;
}
global["consume"] = consume;
global["take"] = consume;


// ASYNC TOOLS

function promisify(fn, custom) {
    return function () {
        var args = [].slice.call(arguments);
        return new Promise(function (resolve, reject) {
            function callback(err, result) {
                if (custom) {
                    var self = {resolve: resolve, reject: reject};
                    return custom.apply(self, [].slice.call(arguments));
                }
                else {
                    if (err) { return reject(err); }
                    else { return resolve(result); }
                }
            }
            args.push(callback);
            return fn.apply(fn, args);
        });
    }
}
global["promisify"] = promisify;


// adapted from https://github.com/lukehoban/ecmascript-asyncawait
function spawn(genF) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var gen = genF.call(self);
        function step(nextF) {
            var next;
            try {
                next = nextF();
            } catch(e) {
                // finished with failure, reject the promise
                reject(e);
                return;
            }
            if(next.done) {
                // finished with success, resolve the promise
                resolve(next.value);
                return;
            } 
            // not finished, chain off the yielded promise and `step` again
            Promise.resolve(next.value).then(function(v) {
                step(function() { return gen.next(v); });      
            }, function(e) {
                step(function() { return gen.throw(e); });
            });
        }
        step(function() { return gen.next(undefined); });
    });
}
global["spawn"] = spawn;



// ERROR FACTORIES

function ErrorFactory(tags) {
    if (!(this instanceof ErrorFactory))
        return new ErrorFactory(tags);
    this.tags = tags;
}
global["ErrorFactory"] = ErrorFactory;

ErrorFactory.prototype.createFrom = function(callee) {
    var e = this.create.apply(this, [].slice.call(arguments, 1));
    if (Error.captureStackTrace)
        Error.captureStackTrace(e, callee);
    return e;
}

ErrorFactory.prototype.create = function(message) {
    var e = Error(message);
    e["::tags"] = this.tags;
    e.args = [].slice.call(arguments, 1);
    enumerate(e.args).forEach(function (iv) {
        e[iv[0]] = iv[1];
    });
    e.length = e.args.length;
    e.name = ["E"].concat(this.tags).join(".");
    if (Error.captureStackTrace)
        Error.captureStackTrace(e, ErrorFactory.prototype.create);
    return e;
}

ErrorFactory.prototype["::check"] = function(e) {
    if (!e || !(e instanceof Error))
        return false
    var tags = e["::tags"] || [];
    for (var i = 0; i < this.tags.length; i++) {
        if (tags.indexOf(this.tags[i]) === -1)
            return false;
    }
    return true;
}


// NODE OBJECTS

function ENode(tags, props, children) {
    if (!(this instanceof ENode))
        return new ENode(tags, props, children);
    if (!(tags instanceof Array)) { tags = [tags]; }
    if (!(children instanceof Array)) { children = [children]; }
    this.tags = tags;
    this.props = props;
    this.children = children;
}
ENode["::egclass"] = true;
ENode["::name"] = "ENode";
// global["Node"] = ENode;
global["ENode"] = ENode;

ENode.fromObject = function (x) {
    if (x && typeof(x) === "object" && x.tags && x.props && x.children) {
        return ENode(x.tags, x.props, ENode.fromObject(x.children));
    }
    else if (Array.isArray(x)) {
        return x.map(ENode.fromObject);
    }
    else {
        return x;
    }
}

ENode.prototype["::check"] = function (n) {
    if (!(n instanceof ENode))
        return false;
    for (var i = 0; i < this.tags.length; i++) {
        if (n.tags.indexOf(this.tags[i]) === -1)
            return false;
    }    
    for (var i = 0; i < this.children.length; i++) {
        if (nequal(n.children[i], this.children[i]))
            return false;
    }
    for (var key in this.props) {
        if (nequal(n.props[key], this.props[key]))
            return false;
    }
    return true;
};

ENode.prototype[":::project"] = function (n) {
    if (this["::check"](n))
        return [true, [n.tags, n.props, n.children]]
    else
        return [false, null]
};

ENode.prototype["::repr"] = function (repr) {
    return this;
};

ENode.prototype.hasTag = function (tag) {
    return this.tags.indexOf(tag) !== -1;
};

ENode.prototype.concat = function (other) {
    return ENode([], {}, [this, other]);
};

ENode.prototype.join = function (sep) {
    if (sep === undefined)
        return this;
    var children = [];
    for (var i = 0; i < this.children.length; i++) {
        if (i > 0) children.push(sep);
        children.push(this.children[i]);
    }
    return ENode(this.tags, this.props, children);
};

ENode.prototype.toString = function () {
    // toString() ignores tags and props entirely
    return this.children.map(function (x) { return String(x); }).join("");
};

function escapeHTML(s) {
    repl = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    }
    return s.replace(/[&<>]/g, function (x) { return repl[x]; });
}

function quotify(s) {
    return '"' + s.replace(/["\\]/g, function (x) { return "\\" + x; }) + '"';
}

var voidTags = [
    "area", "base", "br", "col", "command", "embed", "hr",
    "img", "input", "keygen", "link", "meta", "param", "source",
    "track", "wbr"
]

function toHTML(x) {
    if (typeof(x) === "string") {
        return escapeHTML(x);
    }
    if (Array.isArray(x)) {
        return x.map(function (x) { return toHTML(x); }).join("");
    }
    if (x instanceof ENode) {
        var raw = false;
        var tag = null;
        var classes = [];
        var attrs = items(x.props);
        x.tags.forEach(function (t) {
            if (t[0] === ".")
                classes.push(t.slice(1));
            else if (t[0] === "#")
                attrs.unshift(["id", t.slice(1)]);
            else if (t === "raw")
                raw = true
            else
                tag = t;
        });
        if (classes.length > 0)
            attrs.unshift(["class", classes.join(" ")]);

        var result = "";
        if (tag != null || attrs.length > 0) {
            tag = tag || "span";
            result += "<" + tag;
            attrs.forEach(function (kv) {
                result += " " + kv[0] + "=" + quotify(String(kv[1]));
            });
            result += ">"
        }
        if (x.children.length > 0) {
            x.children.forEach(function (c) {
                result += raw ? String(c) : toHTML(c);
            });
            if (tag) {
                result += "</" + tag + ">"
            }
        }
        else if (tag && voidTags.indexOf(tag) == -1) {
            result += "</" + tag + ">"
        }
        return result;
    }
    return toHTML(String(x));
}

ENode.prototype.toHTML = function () {
    return toHTML(this);
};
