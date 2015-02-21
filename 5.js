
if (!global._egruntime_installed) {
    global._egruntime_installed = true;
    require("babel/polyfill");
    require("./lib");
}

