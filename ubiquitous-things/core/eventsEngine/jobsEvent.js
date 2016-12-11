"use strict";

var emitterSingelton = require("./eventSingelton.js");
var appInfo = require("../datamodel/appsInfo.js")

var eventNEW = "NEWAPPINFO";
//should come from properties
var maxListeners = 20;

var emitter = emitterSingelton.emitter.getInstance().getEmitter();

emitter.setMaxListeners(maxListeners)
//internal
//to be used inside the framework
//data is the json of the appInfo
exports.emitNewAppInfo = function(data){
    emitter.emit(eventNEW,data)
}

//public, to be used by the developers using this framework
exports.setListenerNewAppInfo = function(fun){
    emitter.on(eventNEW,function(data){
        fun(data)
    })
}
exports.setListenerDoneNewAppInfo = function(fun){
    emitter.on(eventNEW,function(data){
        fun(data)
        appInfo.list.getInstance().delete(data.appInfoId)
    })
}




