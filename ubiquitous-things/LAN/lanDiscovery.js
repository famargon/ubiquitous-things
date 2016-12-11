"use strict";

const dgram = require('dgram');
const ip = require('ip');
const net = require("net");
const context = require("../core/datamodel/thingContext.js")
const colleages = require("../core/datamodel/knownThings.js");
const lanUtils = require("./lanUtils.js")
const crypto = require('crypto');
const tls = require('tls');
const fs = require('fs');


var strGreeting;
var meetingsPort; 
var contextServerPort;
var thingContext;
var addresses = [];
var subnet;
var broadcastAddress;
var bufferGreeting;
var hbPort;
var handShakePort;

var secure;
var initialHandshake;
var iv;
var public_key;

const serverOpts = {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-cert.pem'),

    // This is necessary only if using the client certificate authentication.
    requestCert: true,

    // This is necessary only if the client uses the self-signed certificate.
    ca: [ fs.readFileSync('client-cert.pem') ]
};

const connOpts = {
    // Necessary only if using the client certificate authentication
    key: fs.readFileSync('client-key.pem'),
    cert: fs.readFileSync('client-cert.pem'),

    // Necessary only if the server uses the self-signed certificate
    ca: [ fs.readFileSync('server-cert.pem') ]
};


//first called from core
exports.init = function(interPort,greetings,greetingsPort,heartBPort,hsPort,security){
    console.log("Lan discovery initialized")
    contextServerPort = interPort;
    meetingsPort = greetingsPort;
    hbPort = heartBPort;
    handShakePort = hsPort;
    strGreeting = greetings;
    bufferGreeting = new Buffer(strGreeting);
    addresses = lanUtils.getAddresses();
    subnet = ip.subnet(addresses[0].addr, addresses[0].netmask);
    broadcastAddress = subnet.broadcastAddress;
    secure = security
    initMeetingsServer();
    initHeartBeatServer();
    startCheckHeartBeat();
    
}

exports.sendGreetings = function(){
    var client = dgram.createSocket("udp4");
    client.bind({address: addresses[0].addr});
    client.on("listening", function () {
        client.setBroadcast(true);
        console.log("-----------------");
        client.send(bufferGreeting, 0, bufferGreeting.length, meetingsPort, broadcastAddress, function(err, bytes) {
            console.log("closing greetings")
        });
    });
}

//private
//server listening for new things
function initMeetingsServer(){
    var server = dgram.createSocket("udp4");
    server.bind(meetingsPort,function(){
        console.log("Greetings Server bound")
    });
    server.on("message",(msg, source) => {
        //dont let to meet yourself
        if(source.address!=addresses[0].addr && msg.toString()===strGreeting){
            console.log(`server got: ${msg} from ${source.address}:${source.port}`);
            sendAndGetContext(source.address);
        }
    });
}
//interchange of contexts
//sends our context to the contextserver of the thing in addr and get its context from the reply
function sendAndGetContext(addr){
    if(secure){
        const socket = tls.connect(contextServerPort,addr, connOpts, () => {
            console.log('client connected',socket.authorized ? 'authorized' : 'unauthorized');
            if(socket.authorized){
                thingContext = context.thingContext.getInstance().getContext();
                client.write(JSON.stringify(thingContext));
            }
        });
        socket.on('data', (data) => {
            console.log(data);
            timing += colleages.list.getInstance().saveOrUpdateThing(JSON.parse(data));
            client.end();
        });
        socket.on('end', () => {
        server.close();
        });
    }else{
        //try to connect  to the context server of the thing we have just meet
        var client = net.connect({port: contextServerPort,host:addr}, () => {
            // 'connect' listener
            console.log('connected to server!');
            //we send our own context
            thingContext = context.thingContext.getInstance().getContext();
            client.write(JSON.stringify(thingContext));
        });
        client.on('data', (data) => {
            console.log("Thing received in LAN client");
            console.log(JSON.parse(data));
            console.log("----------------------------");
            //we receive its context
            timing += colleages.list.getInstance().saveOrUpdateThing(JSON.parse(data));
            client.end();
        });
        client.on('end', () => {
            console.log('disconnected from server');
        });
    }
}
function initHeartBeatServer(){
    if(secure){
        const server = tls.createServer(serverOpts, (socket) => {
        console.log('server connected',socket.authorized ? 'authorized' : 'unauthorized');
            if(socket.authorized){
                socket.on('data', function(data) {
                    thingContext = context.thingContext.getInstance().getContext();
                    socket.write(JSON.stringify(thingContext));
                    socket.pipe(socket);
                    socket.end();
                });
            }
        });
        server.listen(hbPort, () => {
        console.log('Secure HeartBeat Server bound');
        });
    }else{
        var heartBeatServer = net.createServer((socket)=>{
            socket.on('data', function(data) {
                thingContext = context.thingContext.getInstance().getContext();
                socket.write(JSON.stringify(thingContext));
                socket.pipe(socket);
                socket.end();
            });
        });
        heartBeatServer.listen(hbPort,()=>{
            console.log("HeartBeat Server bound");
        });
    }
}
//heartbeat
var timing = 5000;
function startCheckHeartBeat(){    
    checkHB();
}
function checkHB(){
    var list =colleages.list.getInstance().getAll()
    for(var pos in list){
        console.log("start heartbeat "+JSON.stringify(list[pos]))
        sendHeartBeat(list[pos])
        console.log("end heartbeat")
    } 
    setTimeout(checkHB,timing)
}
var sendHeartBeat = function(destinationContext){
    if(secure){
        const client = tls.connect(hbPort,destinationContext.addr, connOpts, () => {
            console.log('client connected',client.authorized ? 'authorized' : 'unauthorized');
            if(socket.authorized){
                client.write("Are u alive??");
            }
        });
        client.on('data', (data) => {
            console.log(JSON.parse(data));
            //we receive its context
            colleages.list.getInstance().saveOrUpdateThing(JSON.parse(data));
            client.end();
        });
        client.on('end', () => {
            console.log('disconnected from server');
            client.destroy()
        });
        client.on("error",()=>{
            console.log("Error on heartbeat, deleted friend "+destinationContext.id);
            colleages.list.getInstance().delete(destinationContext.id)
            timing -= 5000;
        });
    }else{
        //send to its heartbeat server
        var client = net.connect({port: hbPort,host:destinationContext.addr}, () => {
            client.write("Are u alive??");
        });
        client.on('data', (data) => {
            console.log(JSON.parse(data));
            //we receive its context
            colleages.list.getInstance().saveOrUpdateThing(JSON.parse(data));
            client.end();
        });
        client.on('end', () => {
            console.log('disconnected from server');
            client.destroy()
        });
        client.on("error",()=>{
            console.log("Error on heartbeat, deleted friend "+destinationContext.id);
            colleages.list.getInstance().delete(destinationContext.id)
            timing -= 5000;
        });
    }
}
