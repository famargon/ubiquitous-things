"use strict";

const dgram = require('dgram');
const ip = require('ip');
const net = require("net");
const context = require("../core/thingContext.js")
const things = require("../core/knownThings.js");
const lanUtils = require("./lanUtils.js")

var strGreeting;
var listeningPort; 
var interchangesPort;
var thingContext;
var addresses = [];
var subnet;
var broadcastAddress;
var bufferGreeting;

//first called from core
exports.init = function(interPort,greetings,greetingsPort){
    console.log("Lan discovery initialized")
    interchangesPort = interPort;
    listeningPort = greetingsPort;
    strGreeting = greetings;
    bufferGreeting = new Buffer(strGreeting);
    addresses = lanUtils.getAddresses();
    subnet = ip.subnet(addresses[0].addr, addresses[0].netmask);
    broadcastAddress = subnet.broadcastAddress;
    initMeetingsServer();
}

exports.sendGreetings = function(){
    var client = dgram.createSocket("udp4");

    client.bind();
    client.on("listening", function () {
        client.setBroadcast(true);
        console.log("-----------------");
        console.log("sending greetings");
        client.send(bufferGreeting, 0, bufferGreeting.length, listeningPort, broadcastAddress, function(err, bytes) {
            console.log("closing greetings")
        });
    });
}

//private

//server listening for new things
function initMeetingsServer(){
    var server = dgram.createSocket("udp4");
    server.bind(listeningPort,function(){
        console.log("Greetings Server bound")
    });
    server.on("message",(msg, rinfo) => {
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        //dont let to meet yourself
//        if(rinfo.address!=addresses[0].addr && msg.toString()===strGreeting){
        if(msg.toString()===strGreeting){
            sendAndGetContext(rinfo.address);
        }
    });
}

//interchange of contexts
function sendAndGetContext(addr,port){
    var client = net.connect({port: interchangesPort,host:addr}, () => {
        // 'connect' listener
        console.log('connected to server!');
        thingContext = context.thingContext.getInstance().getContext();
        client.write(JSON.stringify(thingContext));
    });
    client.on('data', (data) => {
        console.log("Thing received in LAN client");
        console.log(JSON.parse(data));
        console.log("----------------------------");
        things.list.getInstance().saveOrUpdateThing(JSON.parse(data));
        client.end();
    });
    client.on('end', () => {
        console.log('disconnected from server');
    });
}

