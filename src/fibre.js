'use strict'

var Finder = Finder || require( './finder.umd' )

var VERSION = '@VERSION'
var FILTER_OUT_SELECTOR = 'style, script, head title'

var global = window || {}
var document = global.document || undefined

function matches( node, selector, boolBypassRegNode ) {
  var Efn = Element.prototype
  var matches = Efn.matches || Efn.mozMatchesSelector || Efn.msMatchesSelector || Efn.webkitMatchesSelector
  
  if ( node instanceof Element ) {
    return matches.call( node, selector ) 
  } else if ( boolBypassRegNode && node instanceof Node ) {
    return true
  }
  return false
}

if ( typeof document === 'undefined' )  throw new Error( 'Fibre requires a DOM-supported environment.' )

var Fibre = function( context ) {
  return new Fibre.fn.init( context )
}

Fibre.version = VERSION

Fibre.fn = Fibre.prototype = {
  constructor: Fibre,

  version: VERSION,

  context: undefined,

  contextSelector: null,

  finder: [],

  init: function( context ) {
    if ( !context )  throw new Error( 'A context is required for Fibre to initialise.' ) 

    if ( context instanceof Node ) {
      this.context = context
    } else if ( typeof context === 'string' ) {
      this.contextSelector = context
      this.context = document.querySelector( context )
    }

    return this
  },

  filterElemFn: function( currentNode ) {
    return matches( currentNode, this.filterSelector, true ) &&
      !matches( currentNode, this.filterOutSelector )
  },

  filterSelector: '*',

  filter: function( selector ) {
    switch ( typeof selector ) {
      case 'string':
        this.filterSelector = selector
        break
      case 'function':
        this.filterElemFn = selector
        break
      default:
        return this
    }
    return this
  },

  filterOutSelector: FILTER_OUT_SELECTOR,

  filterOut: function( selector, boolExtend ) {
    switch( typeof selector ) {
      case 'string':
        if ( typeof boolExtend !== 'undefined' && boolExtend === true ) {
          this.filterOutSelector += selector
        } else {
          this.filterOutSelector = selector
        }
        break
      default:
        return this
    }
    return this
  },

  replace: function( regexp, newSubStr, portionMode ) {
    var it = this
    var portionMode = portionMode || 'retain'
    it.finder.push(Finder( it.context, {
      find: regexp, 
      replace: newSubStr,
      filterElements: function( currentNode ) {
        return it.filterElemFn( currentNode )
      }, 
      portionMode: portionMode
    }))
    return it 
  },

  wrap: function( regexp, strElemName ) {
    var it = this
    var portionMode = portionMode || 'retain'
    it.finder.push(Finder( it.context, {
      find: regexp, 
      wrap: strElemName,
      filterElements: function( currentNode ) {
        return it.filterElemFn( currentNode )
      }
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
