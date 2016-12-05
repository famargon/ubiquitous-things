"use strict";

const net = require("net");
const appsInfo = require("./datamodel/appsInfo.js")

//jobs and interchange apps information server
var jobsPort;

exports.init = function(port){
    //it will allow us to keep a list of jobs or just information, which has been sent to us from things that know me
    const appsInfoServer = net.createServer((socket)=>{
        console.log('client connected to jobs server');
        socket.on('data', function(data) {
            //new job or app info received, store it
            var appInfo = JSON.parse(data);
            console.log(appInfo)
            appsInfo.list.getInstance().addAppInfo(appInfo);
        });
    });
    jobsPort = port;
    appsInfoServer.listen(jobsPort,()=>{
        console.log("Jobs Server bound");
    });
}

//sendTo is the context of the destination thing
exports.sendAppInfo = function(sendTo,jsonAppInfo){
    var client = net.connect({port: jobsPort,host:sendTo.addr}, () => {
        // 'connect' listener
        console.log('connected to jobs server!')
        client.write(JSON.stringify(jsonAppInfo))
    });
    client.on('end', () => {
        console.log('disconnected from jobs server');
    });
}