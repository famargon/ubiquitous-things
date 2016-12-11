"use strict";

const dgram = require('dgram');
const ip = require('ip');
const net = require("net");
const tls = require('tls');
const context = require("../core/datamodel/thingContext.js")
const colleages = require("../core/datamodel/knownThings.js");
const lanUtils = require("./lanUtils.js")

var verbose;
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
var serverOpts;
var connOpts;


//first called from core
exports.init = function(verbose,interPort,greetings,greetingsPort,heartBPort,hsPort,security,sOpts,cOpts){
    this.verbose = verbose;
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
    serverOpts = sOpts
    connOpts = cOpts
    initMeetingsServer();
    initHeartBeatServer();
    startCheckHeartBeat();
    
}

exports.sendGreetings = function(){
    var client = dgram.createSocket("udp4");
    client.bind({address: addresses[0].addr});
    client.on("listening", function () {
        client.setBroadcast(true);
        if(verbose)console.log("-----------------");
        client.send(bufferGreeting, 0, bufferGreeting.length, meetingsPort, broadcastAddress, function(err, bytes) {
            if(verbose)console.log("closing greetings")
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
            if(verbose)console.log(`server got: ${msg} from ${source.address}:${source.port}`);
            sendAndGetContext(source.address);
        }
    });
}
//interchange of contexts
//sends our context to the contextserver of the thing in addr and get its context from the reply
function sendAndGetContext(addr){
    if(secure){
        const socket = tls.connect(contextServerPort,addr, connOpts, () => {
            if(verbose)console.log('client connected',socket.authorized ? 'authorized' : 'unauthorized');
            if(socket.authorized){
                thingContext = context.thingContext.getInstance().getContext();
                socket.write(JSON.stringify(thingContext));
            }
        });
        socket.on('data', (data) => {
            if(verbose)console.log(data);
            timing += colleages.list.getInstance().saveOrUpdateThing(JSON.parse(data));
            socket.end();
        });
        socket.on('end', () => {
            socket.destroy();
        });
    }else{
        //try to connect  to the context server of the thing we have just meet
        var client = net.connect({port: contextServerPort,host:addr}, () => {
            // 'connect' listener
            if(verbose)console.log('connected to server!');
            //we send our own context
            thingContext = context.thingContext.getInstance().getContext();
            client.write(JSON.stringify(thingContext));
        });
        client.on('data', (data) => {
            if(verbose)console.log("Thing received in LAN client");
            if(verbose)console.log(JSON.parse(data));
            if(verbose)console.log("----------------------------");
            //we receive its context
            timing += colleages.list.getInstance().saveOrUpdateThing(JSON.parse(data));
            client.end();
        });
        client.on('end', () => {
            if(verbose)console.log('disconnected from server');
            client.destroy()
        });
    }
}
function initHeartBeatServer(){
    if(secure){
        const server = tls.createServer(serverOpts, (socket) => {
        if(verbose)console.log('server connected',socket.authorized ? 'authorized' : 'unauthorized');
            if(socket.authorized){
                /*socket.on('data', function(data) {
                    thingContext = context.thingContext.getInstance().getContext();
                    socket.write(JSON.stringify(thingContext));
                    socket.pipe(socket);
                    socket.end();
                });*/
            }
            socket.on('data', function(data) {
                    thingContext = context.thingContext.getInstance().getContext();
                    socket.write(JSON.stringify(thingContext));
                    socket.pipe(socket);
                    socket.end();
            });
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
        if(verbose)console.log("start heartbeat "+JSON.stringify(list[pos]))
        sendHeartBeat(list[pos])
        if(verbose)console.log("end heartbeat")
    } 
    setTimeout(checkHB,timing)
}
var sendHeartBeat = function(destinationContext){
    if(secure){
        const client = tls.connect(hbPort,destinationContext.addr, connOpts, () => {
            if(verbose)console.log('client connected',client.authorized ? 'authorized' : 'unauthorized');
            if(client.authorized){
                client.write("Are u alive??");
            }
        });
        client.on('data', (data) => {
            if(verbose)console.log(JSON.parse(data));
            //we receive its context
            colleages.list.getInstance().saveOrUpdateThing(JSON.parse(data));
            client.end();
        });
        client.on('end', () => {
            if(verbose)console.log('disconnected from server');
            client.destroy()
        });
        client.on("error",()=>{
            if(verbose)console.log("Error on heartbeat, deleted friend "+destinationContext.id);
            colleages.list.getInstance().delete(destinationContext.id)
            timing -= 5000;
        });
    }else{
        //send to its heartbeat server
        var client = net.connect({port: hbPort,host:destinationContext.addr}, () => {
            client.write("Are u alive??");
        });
        client.on('data', (data) => {
            if(verbose)console.log(JSON.parse(data));
            //we receive its context
            colleages.list.getInstance().saveOrUpdateThing(JSON.parse(data));
            client.end();
        });
        client.on('end', () => {
            if(verbose)console.log('disconnected from server');
            client.destroy()
        });
        client.on("error",()=>{
            if(verbose)console.log("Error on heartbeat, deleted friend "+destinationContext.id);
            colleages.list.getInstance().delete(destinationContext.id)
            timing -= 5000;
        });
    }
}
