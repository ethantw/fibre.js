/*!
 * Fibre.js v0.2.0 | MIT License | github.com/ethantw/fibre.js
 * Based on findAndReplaceDOMText
 */

void function( Finder ) {

'use strict'

var Finder = Finder || require( './finder.umd' )

var VERSION = '0.2.0'
var NON_INLINE_PROSE = Finder.NON_INLINE_PROSE
var AVOID_NON_PROSE = Finder.PRESETS.prose.filterElements

var global = window || {}
var document = global.document || undefined

function matches( node, selector, bypassNodeType39 ) {
  var Efn = Element.prototype
  var matches = Efn.matches || Efn.mozMatchesSelector || Efn.msMatchesSelector || Efn.webkitMatchesSelector
  
  if ( node instanceof Element ) {
    return matches.call( node, selector ) 
  } else if ( bypassNodeType39 ) {
    if ( /^[39]$/.test( node.nodeType ))  return true
  }
  return false
}

if ( typeof document === 'undefined' )  throw new Error( 'Fibre requires a DOM-supported environment.' )

var Fibre = function( context, preset ) {
  return new Fibre.fn.init( context, preset )
}


Fibre.version = VERSION
Fibre.matches = matches

Fibre.fn = Fibre.prototype = {
  constructor: Fibre,

  version: VERSION,

  finder: [],

  context: undefined,

  portionMode: 'retain',

  selector: {},

  preset: 'prose',

  init: function( context, noPreset ) {
    if ( !!noPreset )  this.preset = null

    this.selector = {
      context: null,
      filter: [],
      avoid: [],
      boundary: []
    }

    if ( !context ) {
      throw new Error( 'A context is required for Fibre to initialise.' ) 
    } else if ( context instanceof Node ) {
      if ( context instanceof Document )  this.context = context.body || context
      else  this.context = context
    } else if ( typeof context === 'string' ) {
      this.context = document.querySelector( context )
      this.selector.context = context
    }
    return this
  },

  filterFn: function( node ) {
    var filter = this.selector.filter.join( ', ' ) || '*'
    var avoid  = this.selector.avoid.join( ', ' ) || null
    var result = matches( node, filter, true ) && !matches( node, avoid )
    return ( this.preset === 'prose' ) ? AVOID_NON_PROSE( node ) && result : result
  },

  boundaryFn: function( node ) {
    var boundary = this.selector.boundary.join( ', ' ) || null
    var result = matches( node, boundary )
    return ( this.preset === 'prose' ) ? NON_INLINE_PROSE( node ) || result : result
  },

  filter: function( selector ) {
    if ( typeof selector === 'string' ) {
      this.selector.filter.push( selector )
    }
    return this
  },

  endFilter: function( all ) {
    if ( all ) {
      this.selector.filter = []
    } else {
      this.selector.filter.pop()
    }
    return this
  },

  avoid: function( selector ) {
    if ( typeof selector === 'string' ) {
      this.selector.avoid.push( selector )
    }
    return this
  },

  endAvoid: function( all ) {
    if ( all ) {
      this.selector.avoid = []
    } else {
      this.selector.avoid.pop()
    }
    return this
  },

  addBoundary: function( selector ) {
    if ( typeof selector === 'string' ) {
      this.selector.boundary.push( selector )
    }
    return this
  },

  removeBoundary: function() {
    this.selector.boundary = []
    return this
  },

  setMode: function( portionMode ) {
    this.portionMode = portionMode === 'first' ? 'first' : 'retain'
    return this
  },

  replace: function( regexp, newSubStr ) {
    var it = this
    it.finder.push(Finder( it.context, {
      find: regexp, 
      replace: newSubStr,
      filterElements: function( currentNode ) {
        return it.filterFn( currentNode )
      }, 
      forceContext: function( currentNode ) {
        return it.boundaryFn( currentNode )
      },
      portionMode: it.portionMode
    }))
    return it 
  },

  wrap: function( regexp, strElemName ) {
    var it = this
    it.finder.push(Finder( it.context, {
      find: regexp, 
      wrap: strElemName,
      filterElements: function( currentNode ) {
        return it.filterFn( currentNode )
      },
      forceContext: function( currentNode ) {
        return it.boundaryFn( currentNode )
      },
      portionMode: it.portionMode
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

// Deprecated API(s)
Fibre.fn.filterOut = Fibre.fn.avoid

// Make sure init() inherit from Fibre()
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

}(

/**
 * findAndReplaceDOMText v 0.4.3
 * @author James Padolsey http://james.padolsey.com
 * @license http://unlicense.org/UNLICENSE
 *
 * Matches the text of a DOM node against a regular expression
 * and replaces each match (or node-separated portions of the match)
 * in the specified element.
 */
 (function() {

  var PORTION_MODE_RETAIN = 'retain'
  var PORTION_MODE_FIRST = 'first'
  var doc = document
  var toString = {}.toString
  var hasOwn = {}.hasOwnProperty
  function isArray(a) {
    return toString.call(a) == '[object Array]'
  }

  function escapeRegExp(s) {
    return String(s).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1')
  }

  function exposed() {
    // Try deprecated arg signature first:
    return deprecated.apply(null, arguments) || findAndReplaceDOMText.apply(null, arguments)
  }

  function deprecated(regex, node, replacement, captureGroup, elFilter) {
    if ((node && !node.nodeType) && arguments.length <= 2) {
      return false
    }
    var isReplacementFunction = typeof replacement == 'function'
    if (isReplacementFunction) {
      replacement = (function(original) {
        return function(portion, match) {
          return original(portion.text, match.startIndex)
        }
      }(replacement))
    }

    // Awkward support for deprecated argument signature (<0.4.0)
    var instance = findAndReplaceDOMText(node, {

      find: regex,

      wrap: isReplacementFunction ? null : replacement,
      replace: isReplacementFunction ? replacement : '$' + (captureGroup || '&'),

      prepMatch: function(m, mi) {

        // Support captureGroup (a deprecated feature)

        if (!m[0]) throw 'findAndReplaceDOMText cannot handle zero-length matches'
        if (captureGroup > 0) {
          var cg = m[captureGroup]
          m.index += m[0].indexOf(cg)
          m[0] = cg
        }
     
        m.endIndex = m.index + m[0].length
        m.startIndex = m.index
        m.index = mi
        return m
      },
      filterElements: elFilter
    })
    exposed.revert = function() {
      return instance.revert()
    }
    return true
  }

  /** 
   * findAndReplaceDOMText
   * 
   * Locates matches and replaces with replacementNode
   *
   * @param {Node} node Element or Text node to search within
   * @param {RegExp} options.find The regular expression to match
   * @param {String|Element} [options.wrap] A NodeName, or a Node to clone
   * @param {String|Function} [options.replace='$&'] What to replace each match with
   * @param {Function} [options.filterElements] A Function to be called to check whether to
   *	process an element. (returning true = process element,
   *	returning false = avoid element)
   */
  function findAndReplaceDOMText(node, options) {
    return new Finder(node, options)
  }

  exposed.NON_PROSE_ELEMENTS = {
    br:1, hr:1,
    // Media / Source elements:
    script:1, style:1, img:1, video:1, audio:1, canvas:1, svg:1, map:1, object:1,
    // Input elements
    input:1, textarea:1, select:1, option:1, optgroup: 1, button:1
  }
  exposed.NON_CONTIGUOUS_PROSE_ELEMENTS = {

    // Elements that will not contain prose or block elements where we don't
    // want prose to be matches across element borders:

    // Block Elements
    address:1, article:1, aside:1, blockquote:1, dd:1, div:1,
    dl:1, fieldset:1, figcaption:1, figure:1, footer:1, form:1, h1:1, h2:1, h3:1,
    h4:1, h5:1, h6:1, header:1, hgroup:1, hr:1, main:1, nav:1, noscript:1, ol:1,
    output:1, p:1, pre:1, section:1, ul:1,
    // Other misc. elements that are not part of continuous inline prose:
    br:1, li: 1, summary: 1, dt:1, details:1, rp:1, rt:1, rtc:1,
    // Media / Source elements:
    script:1, style:1, img:1, video:1, audio:1, canvas:1, svg:1, map:1, object:1,
    // Input elements
    input:1, textarea:1, select:1, option:1, optgroup: 1, button:1,
    // Table related elements:
    table:1, tbody:1, thead:1, th:1, tr:1, td:1, caption:1, col:1, tfoot:1, colgroup:1

  }
  exposed.NON_INLINE_PROSE = function(el) {
    return hasOwn.call(exposed.NON_CONTIGUOUS_PROSE_ELEMENTS, el.nodeName.toLowerCase())
  }
  // Presets accessed via `options.preset` when calling findAndReplaceDOMText():
  exposed.PRESETS = {
    prose: {
      forceContext: exposed.NON_INLINE_PROSE,
      filterElements: function(el) {
        return !hasOwn.call(exposed.NON_PROSE_ELEMENTS, el.nodeName.toLowerCase())
      }
    }
  }
  exposed.Finder = Finder
  /**
   * Finder -- encapsulates logic to find and replace.
   */
  function Finder(node, options) {

    var preset = options.preset && exposed.PRESETS[options.preset]
    options.portionMode = options.portionMode || PORTION_MODE_RETAIN
    if (preset) {
      for (var i in preset) {
        if (hasOwn.call(preset, i) && !hasOwn.call(options, i)) {
          options[i] = preset[i]
        }
      }
    }

    this.node = node
    this.options = options
    // ENable match-preparation method to be passed as option:
    this.prepMatch = options.prepMatch || this.prepMatch
    this.reverts = []
    this.matches = this.search()
    if (this.matches.length) {
      this.processMatches()
    }

  }

  Finder.prototype = {

    /**
     * Searches for all matches that comply with the instance's 'match' option
     */
    search: function() {

      var match
      var matchIndex = 0
      var offset = 0
      var regex = this.options.find
      var textAggregation = this.getAggregateText()
      var matches = []
      var self = this
      regex = typeof regex === 'string' ? RegExp(escapeRegExp(regex), 'g') : regex
      matchAggregation(textAggregation)
      function matchAggregation(textAggregation) {
        for (var i = 0, l = textAggregation.length; i < l; ++i) {

          var text = textAggregation[i]
          if (typeof text !== 'string') {
            // Deal with nested contexts: (recursive)
            matchAggregation(text)
            continue
          }

          if (regex.global) {
            while (match = regex.exec(text)) {
              matches.push(self.prepMatch(match, matchIndex++, offset))
            }
          } else {
            if (match = text.match(regex)) {
              matches.push(self.prepMatch(match, 0, offset))
            }
          }

          offset += text.length
        }
      }

      return matches
    },

    /**
     * Prepares a single match with useful meta info:
     */
    prepMatch: function(match, matchIndex, characterOffset) {

      if (!match[0]) {
        throw new Error('findAndReplaceDOMText cannot handle zero-length matches')
      }
   
      match.endIndex = characterOffset + match.index + match[0].length
      match.startIndex = characterOffset + match.index
      match.index = matchIndex
      return match
    },

    /**
     * Gets aggregate text within subject node
     */
    getAggregateText: function() {

      var elementFilter = this.options.filterElements
      var forceContext = this.options.forceContext
      return getText(this.node)
      /**
       * Gets aggregate text of a node without resorting
       * to broken innerText/textContent
       */
      function getText(node, txt) {

        if (node.nodeType === 3) {
          return [node.data]
        }

        if (elementFilter && !elementFilter(node)) {
          return []
        }

        var txt = ['']
        var i = 0
        if (node = node.firstChild) do {

          if (node.nodeType === 3) {
            txt[i] += node.data
            continue
          }

          var innerText = getText(node)
          if (
            forceContext &&
            node.nodeType === 1 &&
            (forceContext === true || forceContext(node))
          ) {
            txt[++i] = innerText
            txt[++i] = ''
          } else {
            if (typeof innerText[0] === 'string') {
              // Bridge nested text-node data so that they're
              // not considered their own contexts:
              // I.e. ['some', ['thing']] -> ['something']
              txt[i] += innerText.shift()
            }
            if (innerText.length) {
              txt[++i] = innerText
              txt[++i] = ''
            }
          }
        } while (node = node.nextSibling)
        return txt
      }
      
    },

    /** 
     * Steps through the target node, looking for matches, and
     * calling replaceFn when a match is found.
     */
    processMatches: function() {

      var matches = this.matches
      var node = this.node
      var elementFilter = this.options.filterElements
      var startPortion,
        endPortion,
        innerPortions = [],
        curNode = node,
        match = matches.shift(),
        atIndex = 0, // i.e. nodeAtIndex
        matchIndex = 0,
        portionIndex = 0,
        doAvoidNode,
        nodeStack = [node]
      out: while (true) {

        if (curNode.nodeType === 3) {

          if (!endPortion && curNode.length + atIndex >= match.endIndex) {

            // We've found the ending
            endPortion = {
              node: curNode,
              index: portionIndex++,
              text: curNode.data.substring(match.startIndex - atIndex, match.endIndex - atIndex),
              indexInMatch: atIndex - match.startIndex,
              indexInNode: match.startIndex - atIndex, // always zero for end-portions
              endIndexInNode: match.endIndex - atIndex,
              isEnd: true
            }
          } else if (startPortion) {
            // Intersecting node
            innerPortions.push({
              node: curNode,
              index: portionIndex++,
              text: curNode.data,
              indexInMatch: atIndex - match.startIndex,
              indexInNode: 0 // always zero for inner-portions
            })
          }

          if (!startPortion && curNode.length + atIndex > match.startIndex) {
            // We've found the match start
            startPortion = {
              node: curNode,
              index: portionIndex++,
              indexInMatch: 0,
              indexInNode: match.startIndex - atIndex,
              endIndexInNode: match.endIndex - atIndex,
              text: curNode.data.substring(match.startIndex - atIndex, match.endIndex - atIndex)
            }
          }

          atIndex += curNode.data.length
        }

        doAvoidNode = curNode.nodeType === 1 && elementFilter && !elementFilter(curNode)
        if (startPortion && endPortion) {

          curNode = this.replaceMatch(match, startPortion, innerPortions, endPortion)
          // processMatches has to return the node that replaced the endNode
          // and then we step back so we can continue from the end of the 
          // match:

          atIndex -= (endPortion.node.data.length - endPortion.endIndexInNode)
          startPortion = null
          endPortion = null
          innerPortions = []
          match = matches.shift()
          portionIndex = 0
          matchIndex++
          if (!match) {
            break; // no more matches
          }

        } else if (
          !doAvoidNode &&
          (curNode.firstChild || curNode.nextSibling)
        ) {
          // Move down or forward:
          if (curNode.firstChild) {
            nodeStack.push(curNode)
            curNode = curNode.firstChild
          } else {
            curNode = curNode.nextSibling
          }
          continue
        }

        // Move forward or up:
        while (true) {
          if (curNode.nextSibling) {
            curNode = curNode.nextSibling
            break
          }
          curNode = nodeStack.pop()
          if (curNode === node) {
            break out
          }
        }

      }

    },

    /**
     * Reverts ... TODO
     */
    revert: function() {
      // Reversion occurs backwards so as to avoid nodes subsequently
      // replaced during the matching phase (a forward process):
      for (var l = this.reverts.length; l--;) {
        this.reverts[l]()
      }
      this.reverts = []
    },

    prepareReplacementString: function(string, portion, match, matchIndex) {
      var portionMode = this.options.portionMode
      if (
        portionMode === PORTION_MODE_FIRST &&
        portion.indexInMatch > 0
      ) {
        return ''
      }
      string = string.replace(/\$(\d+|&|`|')/g, function($0, t) {
        var replacement
        switch(t) {
          case '&':
            replacement = match[0]
            break
          case '`':
            replacement = match.input.substring(0, match.startIndex)
            break
          case '\'':
            replacement = match.input.substring(match.endIndex)
            break
          default:
            replacement = match[+t]
        }
        return replacement
      })
      if (portionMode === PORTION_MODE_FIRST) {
        return string
      }

      if (portion.isEnd) {
        return string.substring(portion.indexInMatch)
      }

      return string.substring(portion.indexInMatch, portion.indexInMatch + portion.text.length)
    },

    getPortionReplacementNode: function(portion, match, matchIndex) {

      var replacement = this.options.replace || '$&'
      var wrapper = this.options.wrap
      if (wrapper && wrapper.nodeType) {
        // Wrapper has been provided as a stencil-node for us to clone:
        var clone = doc.createElement('div')
        clone.innerHTML = wrapper.outerHTML || new XMLSerializer().serializeToString(wrapper)
        wrapper = clone.firstChild
      }

      if (typeof replacement == 'function') {
        replacement = replacement(portion, match, matchIndex)
        if (replacement && replacement.nodeType) {
          return replacement
        }
        return doc.createTextNode(String(replacement))
      }

      var el = typeof wrapper == 'string' ? doc.createElement(wrapper) : wrapper
      replacement = doc.createTextNode(
        this.prepareReplacementString(
          replacement, portion, match, matchIndex
        )
      )
      if (!replacement.data) {
        return replacement
      }

      if (!el) {
        return replacement
      }

      el.appendChild(replacement)
      return el
    },

    replaceMatch: function(match, startPortion, innerPortions, endPortion) {

      var matchStartNode = startPortion.node
      var matchEndNode = endPortion.node
      var preceedingTextNode
      var followingTextNode
      if (matchStartNode === matchEndNode) {

        var node = matchStartNode
        if (startPortion.indexInNode > 0) {
          // Add `before` text node (before the match)
          preceedingTextNode = doc.createTextNode(node.data.substring(0, startPortion.indexInNode))
          node.parentNode.insertBefore(preceedingTextNode, node)
        }

        // Create the replacement node:
        var newNode = this.getPortionReplacementNode(
          endPortion,
          match
        )
        node.parentNode.insertBefore(newNode, node)
        if (endPortion.endIndexInNode < node.length) { // ?????
          // Add `after` text node (after the match)
          followingTextNode = doc.createTextNode(node.data.substring(endPortion.endIndexInNode))
          node.parentNode.insertBefore(followingTextNode, node)
        }

        node.parentNode.removeChild(node)
        this.reverts.push(function() {
          if (preceedingTextNode === newNode.previousSibling) {
            preceedingTextNode.parentNode.removeChild(preceedingTextNode)
          }
          if (followingTextNode === newNode.nextSibling) {
            followingTextNode.parentNode.removeChild(followingTextNode)
          }
          newNode.parentNode.replaceChild(node, newNode)
        })
        return newNode
      } else {
        // Replace matchStartNode -> [innerMatchNodes...] -> matchEndNode (in that order)


        preceedingTextNode = doc.createTextNode(
          matchStartNode.data.substring(0, startPortion.indexInNode)
        )
        followingTextNode = doc.createTextNode(
          matchEndNode.data.substring(endPortion.endIndexInNode)
        )
        var firstNode = this.getPortionReplacementNode(
          startPortion,
          match
        )
        var innerNodes = []
        for (var i = 0, l = innerPortions.length; i < l; ++i) {
          var portion = innerPortions[i]
          var innerNode = this.getPortionReplacementNode(
            portion,
            match
          )
          portion.node.parentNode.replaceChild(innerNode, portion.node)
          this.reverts.push((function(portion, innerNode) {
            return function() {
              innerNode.parentNode.replaceChild(portion.node, innerNode)
            }
          }(portion, innerNode)))
          innerNodes.push(innerNode)
        }

        var lastNode = this.getPortionReplacementNode(
          endPortion,
          match
        )
        matchStartNode.parentNode.insertBefore(preceedingTextNode, matchStartNode)
        matchStartNode.parentNode.insertBefore(firstNode, matchStartNode)
        matchStartNode.parentNode.removeChild(matchStartNode)
        matchEndNode.parentNode.insertBefore(lastNode, matchEndNode)
        matchEndNode.parentNode.insertBefore(followingTextNode, matchEndNode)
        matchEndNode.parentNode.removeChild(matchEndNode)
        this.reverts.push(function() {
          preceedingTextNode.parentNode.removeChild(preceedingTextNode)
          firstNode.parentNode.replaceChild(matchStartNode, firstNode)
          followingTextNode.parentNode.removeChild(followingTextNode)
          lastNode.parentNode.replaceChild(matchEndNode, lastNode)
        })
        return lastNode
      }
    }

  }
  return exposed
}())

);
