"use strict";

var array = require('lodash/array');

//Singleton pattern for the list of known things
exports.list = (function () {
 
  // Instance stores a reference to the Singleton
  var instance;
 
  function init() {
 
    // Singleton
 
    // Private methods and variables
    var list = [];

 
    return {
 
      // Public methods and variables
      getThing: function(id){
          return array.find(list,function(obj){
              return obj.id === id;
          });
      },
      getAll: function(){
          return list;
      },

      saveOrUpdateThing: function(thing){
          var index = array.findIndex(list,function(obj){
              return obj.id === thing.id;
          });
          if(index>-1){
              //update
              list[index] = thing;
              return 0;
          }else{
              //save 
              list.push(thing);
              return 5000;
          }
      },

      delete: function(id){
          var index = array.findIndex(list,function(obj){
              return obj.id === id;
          });
          if(index>-1){
            list.splice(index,1);
          }
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