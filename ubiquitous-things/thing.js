//entry point to the framework in other words the API
var core = require("./core/core.js")
var colleages = require("./core/datamodel/knownThings.js")

core.init()

exports.getKnownThingById = function(thingId){
    return colleages.list.getInstance().getThing(thingId)   
}
//returns a list with the context of all known things
exports.getAllKnownThings = function(){
    return colleages.list.getInstance.getAll()
}

//destination context of destination app, recommended to get this context with knownThings.getThing
//json, the json to send to the destination app
exports.addAppInfo = function(destination,json){
    core.sendAppInfo(destination,json)
}
exports.getFirstAppInfo = function(){
    return core.getFirstAppInfo();
}
exports.getLastAppInfo = function(){
    return core.getLastAppInfo();
}