var thing = require("../ubiquitous-things/thing.js")

thing.setAppInfoListener(function(data){
    console.log("nice "+JSON.stringify(data))
})