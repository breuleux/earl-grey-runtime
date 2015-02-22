
if (!global._egruntime_installed) {
    global._egruntime_installed = true;
    require("babel-runtime/core-js");
    regeneratorRuntime = require("babel-runtime/regenerator")["default"];
    require("./lib");
}
