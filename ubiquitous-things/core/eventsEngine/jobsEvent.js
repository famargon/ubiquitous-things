var emitterS = require("./eventSingelton.js");

var eventNEW = "NEWAPPINFO";
//should come from properties
var maxListeners = 20;

var emitter = emitterS.emitter.getInstance().getEmitter();

emitter.setMaxListeners(maxListeners)

//to be used by the developers using this framework
exports.setListenerNewAppInfo = function(fun){
    emitter.on(eventNEW,function(data){
        fun(data)
    })
}
//to be used inside the framework
//data is the json of the appInfo
exports.emitNewAppInfo = function(data){
    emitter.emit(eventNEW,data)
}
