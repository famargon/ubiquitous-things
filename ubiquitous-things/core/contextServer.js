"use strict";

const net = require("net");
const context = require("./datamodel/thingContext.js")
const things = require("./datamodel/knownThings.js");

var thingContext;

//interchanges server

exports.init = function(interchangesPort){
    const contextServer = net.createServer((socket)=>{
        console.log('client connected to context server');
        socket.on('data', function(data) {
            var newThing = JSON.parse(data);
            console.log(newThing)
            if(newThing.id!=undefined){
                //add as a known thing saving it's context
                things.list.getInstance().saveOrUpdateThing(newThing);
                //reply with our own context
                thingContext = context.thingContext.getInstance().getContext();
                socket.write(JSON.stringify(thingContext));
                socket.pipe(socket);
                socket.end();
            }
        });
    });

    contextServer.listen(interchangesPort,()=>{
        console.log("Context Server bound");
    });
}

