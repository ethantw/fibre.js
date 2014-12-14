
// ### EXPOSE ###
if ( typeof define === 'function'  && define.amd ) {
  define(function() { return Fibre })
} else if ( typeof module === 'object' && typeof module.exports === 'object' ) {
  module.exports = Fibre 
} else {
  global.Fibre = Fibre
}
// ### EXPOSE ###

}();

