
var VERSION = '0.1.0'
var FILTER_OUT_SELECTOR = 'style, script, title'
var Finder = Finder || require( './fardt.module' )

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

if ( typeof document === 'undefined' )
  throw new Error( 'Fibre requires an environment with support of DOM.' )

var Fibre = function( context ) {
  return Fibre.fn.init( context )
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
    if ( typeof selector === 'string' ) {
      if ( typeof notToOverride !== 'undefined' && notToOverride === true )
        this.filterOutSelector += selector
      else
        this.filterOutSelector = selector
    } else if ( typeof selector === 'function' )
      this.filterOutFn = selector
    return this
  },

  init: function( context ) {
    if ( !context )  throw new Error( 'A context is required for Fibre to initialise.' ) 
    this.context = context 
    return this
  },

  replace: function( regexp, newSubStr ) {
    this.finder.push(Finder( this.context, {
      find: regexp, 
      replace: newSubStr,
      filterElements: this.filterOutFn  
    }))
    return this
  },

  wrap: function( regexp, newDOMObj ) {
    this.finder.push(Finder( this.context, {
      find: regexp, 
      wrap: newDOMObj,
      filterElements: this.filterOutFn  
    }))
    return this
  },

  revert: function( level ) {
    var max = this.finder.length        
    var level = Number( level ) || level === 0 ? Number(0) :
      level === 'all' ? max : 1

    if ( typeof max === 'undefined' || max === 0 )  return this
    else if ( level > max )  level = max

    for ( var i = level; i > 0; i-- ) {
      this.finder.pop().revert()
    }
    return this
  }
}

Fibre.fn.init.prototype = Fibre.fn

