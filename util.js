
function collapse(x) {
    if (Array.isArray(x)) {
        var res = [];
        x.forEach(function (y) {
            if (Array.isArray(y))
                res = res.concat(y);
            else
                res.push(y);
        });
        return res;
    }
    else {
        return x;
    }
}

function convertHTML(x, create) {
    // create(tag, attrs, children, source)
    if (Array.isArray(x)) {
        return collapse(x.map(function (x) { return convertHTML(x, create); }));
    }
    else if (x instanceof ENode) {
        var raw = false;
        var tag = null;
        var classes = [];
        var attrs = clone(x.props);
        var children = [];
        x.tags.forEach(function (t) {
            if (t[0] === ".")
                classes.push(t.slice(1));
            else if (t[0] === "#")
                attrs.id = t.slice(1);
            else if (t === "raw")
                raw = true
            else
                tag = t;
        });
        if (classes.length > 0)
            attrs["class"] = classes.join(" ");
        if (raw) {
            attrs.innerHTML = "";
            x.children.forEach(function (c) {
                attrs.innerHTML += String(c);
            });
        }
        else {
            x.children.forEach(function (c) {
                children.push(convertHTML(c, create));
            });
        }
        children = collapse(children);

        if (tag === null && equal(attrs, {})) {
            return children;
        }
        else if (tag === null && raw && equal(keys(attrs), ["innerHTML"])) {
            return create("", attrs, children, x);
        }
        else {
            return create(tag || "span", attrs, children, x);
        }
    }
    else {
        return create(null, null, x, x);
    }
}

exports.convertHTML = convertHTML
