var Finder = Finder || require( './fardt.module' )

var VERSION = '@VERSION'
var FILTER_OUT_SELECTOR = 'style, script, head title'

var global = window || {}
var document = global.document || undefined

function matches( node, selector ) {
  var Efn = Element.prototype
  var matches = Efn.matches || Efn.mozMatchesSelector || Efn.msMatchesSelector || Efn.webkitMatchesSelector
  
  try {
    return matches.call( node, selector )
  } catch (e) {
    return false
  }
}

if ( typeof document === 'undefined' )  throw new Error( 'Fibre requires a DOM-supported environment.' )

var Fibre = function( context ) {
  return new Fibre.fn.init( context )
}

Fibre.version = VERSION

Fibre.fn = Fibre.prototype = {
  constructor: Fibre,

  version: VERSION,

  context: null,  

  finder: [],

  filterOutSelector: FILTER_OUT_SELECTOR,

  filterOutFn: function( currentNode ) {
    if ( matches( currentNode, this.filterOutSelector ))  return false
    return true
  },

  filterOut: function( selector, notToOverride ) {
    switch( typeof selector ) {
      case 'string':
        if ( typeof notToOverride !== 'undefined' && notToOverride === true ) {
          this.filterOutSelector += selector
        } else {
          this.filterOutSelector = selector
        }
        break
      case 'function':
        this.filterOutFn = selector
        break
      default:
        return this
    }
    return this
  },

  init: function( context ) {
    if ( !context )  throw new Error( 'A context is required for Fibre to initialise.' ) 
    this.context = context 
    return this
  },

  replace: function( regexp, newSubStr, portionMode ) {
    var it = this
    var portionMode = portionMode || 'retain'
    it.finder.push(Finder( it.context, {
      find: regexp, 
      replace: newSubStr,
      filterElements: function( currentNode ) {
        return it.filterOutFn( currentNode )
      }, 
      portionMode: portionMode
    }))
    return it 
  },

  wrap: function( regexp, newDOMObj, portionMode ) {
    var it = this
    var portionMode = portionMode || 'retain'
    it.finder.push(Finder( it.context, {
      find: regexp, 
      wrap: newDOMObj,
      filterElements: function( currentNode ) {
        return it.filterOutFn( currentNode )
      }, 
      portionMode: portionMode
    }))
    return it
  },

  revert: function( level ) {
    var max = this.finder.length        
    var level = Number( level ) || ( level === 0 ? Number(0) :
      ( level === 'all' ? max : 1 ))

    if ( typeof max === 'undefined' || max === 0 )  return this
    else if ( level > max )  level = max

    for ( var i = level; i > 0; i-- ) {
      this.finder.pop().revert()
    }
    return this
  }
}

Fibre.fn.init.prototype = Fibre.fn

// EXPOSE
if ( typeof define === 'function' && define.amd ) {
  define(function() {  return Fibre  })
} else if ( typeof module === 'object' && typeof module.exports === 'object' ) {
  module.exports = Fibre 
} else {
  global.Fibre = Fibre
}
// EXPOSE
