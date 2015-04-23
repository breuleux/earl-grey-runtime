
var convertHTML = require("../util").convertHTML;

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

module.exports = DOM
DOM.DOM = DOM
DOM.toDOM = toDOM

