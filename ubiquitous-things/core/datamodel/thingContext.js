"use strict";

const properties = require("../properties.js");

//Singleton pattern for things context
exports.thingContext = (function () {
 
  // Instance stores a reference to the Singleton
  var instance;
 
  function init() {
 
    // Singleton
 
    // Private methods and variables
    var propObj = properties.getProperties();
    var addrs;
    if(propObj.lanMode){
      const lanUtils  = require("../../LAN/lanUtils.js");
      addrs = lanUtils.getAddresses();
    }
    var context = {
      id: "ubi"+propObj.appName+Math.floor(Math.random() * 100) + 1,
      lanMode: propObj.lanMode, 
      addr: addrs[0].addr 
    }
        
 
    return {
 
      // Public methods and variables
      contextVersion: propObj.contextVersion,

      getContext: function(){
          return context;
      },

      setContext: function(obj){
          context = obj;
      }
 
    };
 
  };
 
  return {
 
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {
 
      if ( !instance ) {
        instance = init();
      }
 
      return instance;
    }
 
  };
 
})();