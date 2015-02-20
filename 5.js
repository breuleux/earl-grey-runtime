
if (global._egruntime_installed)
    return

global._egruntime_installed = true;
require("babel/polyfill");
require("./lib");
