
var _util = require("../util");
var convertHTML = _util.convertHTML;
var convertHTML2 = _util.convertHTML2;
var normalize = _util.normalize;


function toDOM2(tag, classes, attrs, children, raw) {

    if (tag === null) {
        if (children instanceof Element)
            return children;
        else
            return document.createTextNode(String(children));
    }
    
    if (tag == "top") tag = "";

    if (!tag && (equal(classes, []) && equal(attrs, {}))) {
        if (children.length == 1)
            return children[0];
        else {
            var node = document.createElement("span");
            children.forEach(function (x) {
                node.appendChild(x);
            });
            return node;
        }
    }

    tag = tag || "span";

    if (attrs.namespace)
        var node = document.createElementNS(attrs.namespace, tag);
    else
        var node = document.createElement(tag);

    if (attrs.id)
        node.id = attrs.id;

    if (classes.length > 0)
        node.className = classes.join(" ");

    if (raw) {
        node.innerHTML = raw;
    }

    items(attrs).forEach(function (kv) {
        if (kv[0].startsWith("on"))
            node[kv[0]] = kv[1];
        else
            node.setAttribute(kv[0], kv[1]);
    });

    children.forEach(function (c) {
        node.appendChild(c);
    });

    return node;
}



function toDOM(tag, attrs, children) {
    if (tag === null) {
        if (children instanceof Element)
            return children;
        else
            return document.createTextNode(String(children));
    }
    else if (tag === "top") {
        var node = document.createElement(tag);
        children.forEach(function (c) {
            node.appendChild(c);
        });
        return node;
    }
    else {
        if (attrs.namespace)
            var node = document.createElementNS(attrs.namespace, tag);
        else
            var node = document.createElement(tag);
        if (attrs.id) node.id = attrs.id;
        if (attrs["class"]) node.className = attrs["class"];
        if (attrs.innerHTML) {
            node.innerHTML = attrs.innerHTML;
            delete attrs.innerHTML;
        }
        items(attrs).forEach(function (kv) {
            if (kv[0].startsWith("on"))
                node[kv[0]] = kv[1];
            else
                node.setAttribute(kv[0], kv[1]);
        });
        children.forEach(function (c) {
            node.appendChild(c);
        });
        return node;
    }
}

function DOM(enode, converter) {
    if (!converter)
        converter = toDOM;
    var res = convertHTML(enode, converter);
    if (Array.isArray(res))
        res = converter("top", {}, res);
    return res;
}

function DOM2(enode, converter) {
    if (!converter)
        converter = toDOM2;
    var res = convertHTML2(enode, converter);
    if (Array.isArray(res))
        res = converter("top", [], {}, res, null);
    return res;
}

function DOMNode(tags, props, children) {
    if (!Array.isArray(children))
        children = [children];
    return toDOM2.apply(null, normalize(tags, props, children));
}

function percentMacro(expr) {
    var DOMNode = this.deps.DOMNode;
    return ["multi",
            ["send", ["symbol", "="],
             ["data",
              ["send", ["symbol", "let"], ["symbol", "ENode"]],
              DOMNode]],
            ["send",
             ["symbol", "%"],
             ["data", expr[1], expr[2]]]]
}
percentMacro.__deps = {DOMNode: "ENode"};
percentMacro.__path = __filename;

module.exports = DOM2;
DOM2.DOM = DOM2;
DOM2.toDOM = toDOM2;
DOM2.ENode = DOMNode;
DOM2["%"] = percentMacro;
DOM2.normalize = normalize;
