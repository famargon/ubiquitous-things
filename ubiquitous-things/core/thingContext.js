"use strict";

//Singleton pattern for things context
exports.thingContext = (function () {
 
  // Instance stores a reference to the Singleton
  var instance;
 
  function init() {
 
    // Singleton
 
    // Private methods and variables
    var context = {"id":"context test"}

 
    return {
 
      // Public methods and variables
      contextVersion: "0",

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