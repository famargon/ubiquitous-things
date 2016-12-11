//this js should read (in a future) a .properties file and return this info in a object 

exports.getProperties = function(){
    return {
        lanMode: true,
        contextVersion: "0",
        //its usefull for a developer to change the appName
        appName: "testName",
        secure: true,
        verbose: false
    }
}