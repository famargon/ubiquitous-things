"use strict";

var contextServer = require("./contextServer.js");
var lanDiscovery = require("../LAN/lanDiscovery.js")
var context = require("./thingContext.js")

//init variables
var interchangesPort = "9999";
var strGreeting = "IMATHING";
var greetingsPort = "8888";
var thingContext = context.thingContext.getInstance();

//properties, should be configured via .properties or something
var lanMode = true;


//test
console.log(thingContext.getContext());
var ctx = thingContext.getContext();
ctx.location = "mi casa";
thingContext.setContext(ctx);
//

exports.init = function(){
    contextServer.init(interchangesPort);
    lanDiscovery.init(interchangesPort,strGreeting,greetingsPort);
    if(lanMode){
        lanDiscovery.sendGreetings();
    }
}



