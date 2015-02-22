
if (!global._egruntime_installed) {
    global._egruntime_installed = true;
    require("core-js/shim");
    require("regenerator/runtime");
    require("./lib");
}
