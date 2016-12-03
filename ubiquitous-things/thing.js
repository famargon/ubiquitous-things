var core = require("./core/core.js");

core.init();

exports.addAppInfo = function(contextInfo,json){
    core.sendAppInfo(contextInfo,json);
}