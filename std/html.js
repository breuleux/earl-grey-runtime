
var convertHTML = require("../util").convertHTML;

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

module.exports = HTML
HTML.HTML = HTML
HTML.toHTML = toHTML

