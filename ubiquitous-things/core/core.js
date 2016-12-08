"use strict";

var contextServer = require("./contextServer.js");
var lanDiscovery = require("../LAN/lanDiscovery.js")
var jobsServer = require("./jobsServer.js")
var context = require("./datamodel/thingContext.js")
var properties = require("./properties.js")
var appsInfo = require("./datamodel/appsInfo.js")

//init variables
var contextServerPort = "9999";
var strGreeting = "IMATHING";
var greetingsPort = "8888";
var jobsPort = "8069"; //listen port to receive jobs or exange applications information, its responsibility of the apps using this framework to be able to understand the json objects received in this port
var thingContext = context.thingContext.getInstance().getContext();

//properties, should be configured via .properties or something
var propObj = properties.getProperties();

exports.init = function(){
    console.log("my id is " + JSON.stringify(thingContext))    
    contextServer.init(contextServerPort);
    jobsServer.init(jobsPort);
    if(propObj.lanMode){
        lanDiscovery.init(contextServerPort,strGreeting,greetingsPort);
        lanDiscovery.sendGreetings();
    }
}

exports.sendAppInfo = function(destinationContext,jsonAppInfo){
    jobsServer.sendAppInfo(destinationContext,jsonAppInfo);
}
exports.getFirstAppInfo = function(){
    return appsInfo.list.getInstance().getFirstAppInfo();
}
exports.getLastAppInfo = function(){
    return appsInfo.list.getInstance().getLastAppInfo();
}



