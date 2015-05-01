
var _util = require("../util");
var convertHTML = _util.convertHTML;
var convertHTML2 = _util.convertHTML2;
var normalize = _util.normalize;

function escapeHTML(s) {
    var repl = {
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

function toHTML2(tag, classes, attrs, children, raw) {

    if (tag === null)
        return escapeHTML(String(children));

    var result = "";

    if (tag == "top") tag = "";

    if (!equal(classes, [])) {
        attrs["class"] = classes.join(" ");
    }
    if (!tag && (!equal(classes, []) || !equal(attrs, {}))) {
        tag = "span";
    }

    if (tag) result += "<" + tag;
    items(attrs).forEach(function (kv) {
        result += " " + kv[0] + "=" + quotify(String(kv[1]));
    });
    if (tag) result += ">";

    var closeTag = tag && voidTags.indexOf(tag) == -1;

    if (raw !== null) {
        result += raw;
        closeTag = !!tag;
    }
    else if (children.length > 0) {
        children.forEach(function (c) {
            result += c;
        });
        closeTag = !!tag;
    }

    if (closeTag)
        result += "</" + tag + ">"

    return result;
}


function toHTML(tag, attrs, children) {
    if (tag === null) {
        return escapeHTML(String(children));
    }
    else if (tag === "top") {
        return children.join("");
    }
    else {
        var result = "";
        if (tag != "")
            result += "<" + tag;
        var innerhtml = null;
        if (attrs.innerHTML) {
            innerhtml = String(attrs.innerHTML);
            delete attrs.innerHTML;
        }
        items(attrs).forEach(function (kv) {
            result += " " + kv[0] + "=" + quotify(String(kv[1]));
        });
        if (tag != "")
            result += ">"
        if (innerhtml) {
            result += innerhtml
            if (tag != "")
                result += "</" + tag + ">"
        }
        else if (children.length > 0) {
            children.forEach(function (c) {
                result += c;
            });
            if (tag != "")
                result += "</" + tag + ">"
        }
        else if (tag && voidTags.indexOf(tag) == -1) {
            if (tag != "")
                result += "</" + tag + ">"
        }
        return result;            
    }
}

function HTML(enode, converter) {
    if (!converter)
        converter = toHTML;
    var res = convertHTML(enode, converter);
    if (Array.isArray(res))
        res = converter("top", {}, res);
    return res;
}

function HTML2(enode, converter) {
    if (!converter)
        converter = toHTML2;
    var res = convertHTML2(enode, converter);
    if (Array.isArray(res))
        res = converter("top", [], {}, res, null);
    return res;
}

function HTMLNode(tags, props, children) {
    if (!Array.isArray(children))
        children = [children];
    return toHTML2.apply(null, normalize(tags, props, children));
}

function percentMacro(expr) {
    var HTMLNode = this.deps.HTMLNode;
    return ["multi",
            ["send", ["symbol", "="],
             ["data",
              ["send", ["symbol", "let"], ["symbol", "ENode"]],
              HTMLNode]],
            ["send",
             ["symbol", "%"],
             ["data", expr[1], expr[2]]]]
}
percentMacro.__deps = {HTMLNode: "ENode"};
percentMacro.__path = __filename;

module.exports = HTML2;
HTML2.HTML = HTML2;
HTML2.toHTML = toHTML2;
HTML2.ENode = HTMLNode;
HTML2["%"] = percentMacro;
HTML2.normalize = normalize;
