//entry point to the framework in other words the API
var core = require("./core/core.js")
var colleages = require("./core/datamodel/knownThings.js")
var events = require("./core/eventsEngine/jobsEvent.js")
var appInfo = require("./core/datamodel/appsInfo.js")

core.init()

exports.getKnownThingById = function(thingId){
    return colleages.list.getInstance().getThing(thingId)   
}
//returns a list with the context of all known things
exports.getAllKnownThings = function(){
    return colleages.list.getInstance().getAll()
}

//destination, context of destination app, recommended to get this context with knownThings.getThing
//json, the json to send to the destination app
exports.sendAppInfo = function(destination,json){
    core.sendAppInfo(destination,json)
}
exports.getFirstAppInfo = function(){
    return core.getFirstAppInfo();
}
exports.getLastAppInfo = function(){
    return core.getLastAppInfo();
}

//setAppInfoListener and setAppInfoDone should be used together by developers to delete a job when it's done
//fun have to be a function which accepts the json of the appInfo
exports.setAppInfoListener = function(fun){
    events.setListenerNewAppInfo(fun)
}
exports.setAppInfoDone = function(id) {
    appInfo.list.getInstance().delete(appInfoId)
}

//sets the listener for a incoming app info and finnally delete this job
//fun have to be a function which accepts the json of the appInfo
exports.setAIListenerDone = function(fun){
    events.setListenerDoneNewAppInfo(fun)
}