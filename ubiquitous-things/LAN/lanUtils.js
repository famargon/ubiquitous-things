const os = require("os");

exports.getAddresses = function(){
    var addresses = [];
    const interfaces = os.networkInterfaces();
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push({"addr":address.address,"netmask":address.netmask});
            }
        }
    }
    return addresses;
}
