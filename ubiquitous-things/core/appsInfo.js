"use strict";

var array = require('lodash/array');

//Singleton pattern for list of jobs or applications information that they exchange
exports.list = (function () {
 
  // Instance stores a reference to the Singleton
  var instance;
 
  function init() {
 
    // Singleton
 
    // Private methods and variables
    //new items in this list will be at the end, oldest items will be at the begining
    var list = [];

 
    return {
 
      // Public methods and variables
      addAppInfo: function(obj){
          list.push(obj);
      },
      //returns the oldest job or app info and delete it form the list
      getFirstAppInfo: function(){
          return list.shift();
      },
      //returns the newest job or app info and delete it from de list
      getLastAppInfo: function(){
          return list.pop();
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