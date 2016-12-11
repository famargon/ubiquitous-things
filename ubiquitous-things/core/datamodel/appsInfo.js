"use strict";

var array = require('lodash/array');
var jobsEvent = require('../eventsEngine/jobsEvent.js')

//Singleton pattern for list of jobs or applications information that they exchange
exports.list = (function () {
 
  // Instance stores a reference to the Singleton
  var instance;
 
  function init() {
 
    // Singleton
 
    // Private methods and variables
    //new items in this list will be at the end, oldest items will be at the begining
    var list = [];
    var intId = 0;
 
    return {
 
      // Public methods and variables
      addAppInfo: function(obj){
        if(intId==1000){
          intId = 0
        }
        obj.appInfoId= intId++;
        list.push(obj);
        jobsEvent.emitNewAppInfo(obj);
      },

      //DELETE APP INFO
      delete: function(obj){
        var index = array.findIndex(list,function(a){
              return a.appInfoId === obj.appInfoId;
        });
        if(index>-1){
          var toRet = list[index]
          list.splice(index,1);
          return toRet;
        }
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