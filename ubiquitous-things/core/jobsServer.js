"use strict";

const net = require("net");
const tls = require('tls');
const appsInfo = require("./datamodel/appsInfo.js")

//jobs and interchange apps information server
var jobsPort;
var secure;
var connOpts;
var verbose;

exports.init = function(verbose,port,security,options,cOpts){
    //it will allow us to keep a list of jobs or just information, which has been sent to us from things that know me
    this.verbose = verbose;
    secure = security;
    if(secure){
        connOpts = cOpts;
        const server = tls.createServer(options, (socket) => {
        if(verbose)console.log('server connected',socket.authorized ? 'authorized' : 'unauthorized');
            if(socket.authorized){
                if(verbose)console.log('client connected to jobs server');
                socket.on('data', function(data) {
                    //new job or app info received, store it
                    var appInfo = JSON.parse(data);
                    if(verbose)console.log(appInfo)
                    appsInfo.list.getInstance().addAppInfo(appInfo);
                });
            }
        });
        jobsPort = port;
        server.listen(jobsPort, () => {
            console.log('Secure Jobs Server bound');
        });
    }else{
        const appsInfoServer = net.createServer((socket)=>{
            if(verbose)console.log('client connected to jobs server');
            socket.on('data', function(data) {
                //new job or app info received, store it
                var appInfo = JSON.parse(data);
                if(verbose)console.log(appInfo)
                appsInfo.list.getInstance().addAppInfo(appInfo);
            });
        });
        jobsPort = port;
        appsInfoServer.listen(jobsPort,()=>{
            console.log("Jobs Server bound");
        });
    }
}

//sendTo is the context of the destination thing
exports.sendAppInfo = function(sendTo,jsonAppInfo){
    if(sendTo!=undefined){
        if(secure){
            const socket = tls.connect(jobsPort,sendTo.addr, connOpts, () => {
                if(verbose)console.log('client connected',socket.authorized ? 'authorized' : 'unauthorized');
                if(socket.authorized){
                    // 'connect' listener
                    if(verbose)console.log('connected to jobs server!')
                    socket.write(JSON.stringify(jsonAppInfo))
                }
            });
            socket.on('end', () => {
                if(verbose)console.log('disconnected from jobs server');
                socket.destroy()
            });
        }else{
            var client = net.connect({port: jobsPort,host:sendTo.addr}, () => {
                // 'connect' listener
                if(verbose)console.log('connected to jobs server!')
                client.write(JSON.stringify(jsonAppInfo))
            });
            client.on('end', () => {
                if(verbose)console.log('disconnected from jobs server');
                client.destroy()
            });
        }        
    }
}