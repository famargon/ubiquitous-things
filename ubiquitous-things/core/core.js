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
var hbPort = "9898";
var handSPort = "9787";
var jobsPort = "8069"; //listen port to receive jobs or exange applications information, its responsibility of the apps using this framework to be able to understand the json objects received in this port
var thingContext = context.thingContext.getInstance().getContext();

//properties, should be configured via .properties or something
var propObj = properties.getProperties();

exports.init = function(){
    console.log("my id is " + JSON.stringify(thingContext))  
    var serverOpts;
    var connOpts;  
    if(propObj.secure){
        const fs = require('fs');
        serverOpts = {
            key: fs.readFileSync('./server-key.pem'),
            cert: fs.readFileSync('./server-cert.pem'),
            // This is necessary only if using the client certificate authentication.
            requestCert: true,
            rejectUnauthorized: true,
            // This is necessary only if the client uses the self-signed certificate.
            ca: [ fs.readFileSync('./client-cert.pem') ]
        };
        connOpts = {
            // Necessary only if using the client certificate authentication
            key: fs.readFileSync('./client-key.pem'),
            cert: fs.readFileSync('./client-cert.pem'),
            rejectUnauthorized: true,
            checkServerIdentity: function (host, cert) {
            return undefined;
            },
            // Necessary only if the server uses the self-signed certificate
            ca: [ fs.readFileSync('./server-cert.pem') ]
        };
    }
    contextServer.init(contextServerPort,propObj.secure,serverOpts);
    jobsServer.init(jobsPort,propObj.secure,serverOpts,connOpts);
    if(propObj.lanMode){
        lanDiscovery.init(contextServerPort,strGreeting,greetingsPort,hbPort,handSPort,propObj.secure,serverOpts,connOpts);
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

setTimeout(function(){
    var json = {test:"esto es test"};
    jobsServer.sendAppInfo( thingContext , json);
},5000)




