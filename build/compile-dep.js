
'use strict';

var fs = require( 'fs' )

var EXPOSED = '// EXPOSE\nif (typeof define===\'function\'&&define.amd){define(function(){return exposed});}else if(typeof module!==\'undefined\'&&module.exports){module.exports=exposed;}else{window.findAndReplaceDOMText = exposed;}\n// EXPOSE'

var argv = process.argv.slice( 2 )
var fardt = argv[0] || './findAndReplaceDOMText/src/findAndReplaceDOMText.js'
var build = argv[1] || './src/fardt.js'
var build_module = argv[2] || './src/fardt.module.js'
var src = fs.readFileSync( fardt )
var src_module = src 

src = src.toString()
  .replace( 'window.findAndReplaceDOMText =', 'var Finder =' )

fs.writeFile(
  build,
  src,
  function( err ) {
    if ( err )  console.log( err )
  }
)

src_module = src_module.toString()
  .replace( 'window.findAndReplaceDOMText =', 'void' )
  .replace( '	return exposed;', EXPOSED )

fs.writeFile(
  build_module,
  src_module,
  function( err ) {
    if ( err )  console.log( err )
  }
)
