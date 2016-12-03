"use strict";

const net = require("net");
const appsInfo = require("./appsInfo.js")

//jobs and interchange apps information server
var jobsPort;

exports.init = function(port){
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

exports.sendAppInfo = function(sendTo,jsonAppInfo){
    var client = net.connect({port: jobsPort,host:sendTo.addr}, () => {
        // 'connect' listener
        console.log('connected to jobs server!');
        client.write(JSON.stringify(jsonAppInfo));
    });
    client.on('end', () => {
        console.log('disconnected from jobs server');
    });
}