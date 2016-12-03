"use strict";

var contextServer = require("./contextServer.js");
var lanDiscovery = require("../LAN/lanDiscovery.js")
var jobsServer = require("./jobsServer.js")
var context = require("./thingContext.js")
var properties = require("./properties.js")

//init variables
var interchangesPort = "9999";
var strGreeting = "IMATHING";
var greetingsPort = "8888";
var jobsPort = "8069"; //listen port to receive jobs or exange applications information, its responsibility of the apps using this framework to be able to understand the json objects received in this port
var thingContext = context.thingContext.getInstance();

//properties, should be configured via .properties or something
var propObj = properties.getProperties();

exports.init = function(){
    contextServer.init(interchangesPort);
    lanDiscovery.init(interchangesPort,strGreeting,greetingsPort);
    jobsServer.init(jobsPort);
    if(propObj.lanMode){
        lanDiscovery.sendGreetings();
    }
}

exports.sendAppInfo = function(destinationContext,jsonAppInfo){
    jobsServer.sendAppInfo(destinationContext,jsonAppInfo);
}



