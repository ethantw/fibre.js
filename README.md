
# Fibre.js
Fibre.js is a small library based on [`FindAndReplaceDOMText`][fardt] by [James Padolsey][jp].

The methods provided by Fibre search for the regular expression matches in a given context (a DOM node) and replaces/wraps each one of them with a new text run or a new DOM node. 

*Chaining & string-like syntax supported.*

[fardt]: https://github.com/padolsey/findAndReplaceDOMText
[jp]: http://james.padolsey.com

## Install
- NPM `npm i fibre.js --save`
- Bower `bower install git://github.com/ethantw/fibre.js`

### Require the library
Use the `script` element,
```html
<script src="vendor/fibre.js/fibre.js"></script>
```

AMD,
```javascript
require( './node_modules/fibre.js/src/fibre', function( Fibre ) {
  var fibre = Fibre( document.body )
  …
})
```

CommonJS (NPM),
```javascript
var Fibre = require( 'fibre.js' )
var fibre = Fibre( document.body )
…
```

## Run test
- Install dependencies `sudo npm i`
- Run test `gulp test`

## Browser support
Fibre.js works on all *modern* browsers with no legacy support for older IE.

## License
Fibre.js is released under MIT License.

* * *

# API
- [Introduction](#introduction)
- [Fibre.fn.wrap()](#fibrefnwrap)
- [Fibre.fn.replace()](#fibrefnreplace)
- [Fibre.fn.filter()](#fibrefnfilter)
- [Fibre.fn.filterOut()](#fibrefnfilterout)
- [Fibre.fn.revert()](#fibrefnrevert)
- [Fibre.matches()](#fibrematches)

## Introduction 
The syntax is *as simple as jQuery!*

`Fibre` needs no `new` operator to create an instance. Assign *one* DOM node to the first parametre `context` to initialise. 

### Syntax
```javascript
var fibre = Fibre( context )

fibre
  .replace( … )
  .wrap( … )
```

### Examples
```javascript
// Regular DOM node
Fibre( document.body )
// Document node
Fibre( document )
// jQuery object
Fibre( $( '.container article' )[0] )
// CSS selector (will only affect the first matched node)
Fibre( '.container article' )
```

## Fibre.fn.wrap()
The method wraps an assigned node round the matched text in the given context.

### Syntax
```javascript
fibre.wrap( regexp|substr, strElemName|node[, portionMode] )
```
### Parametres

<dl>
<dt><code>regexp</code>
<dd>A RegExp object. Text that matches will be wrapt by the return node of parametre #2.

<dt><code>substr</code>
<dd>A String of which matches is to be wrapt by the return node of parametre #2.

<dt><code>strElemName</code>
<dd>A string of an element name to wrap round the matched text.

<dt><code>node</code>
<dd>A node that is to be cloned for each match portion. 

<dt><code>portionMode</code>
<dd><em>Optional</em>. String of either one of <code>'retain'</code> or <code>'first'</code>, which indicates whether to re-use the existing node boundaries when wrapping a match text, or simply place the entire replacement in the first-found match portion's node. The default value is <code>'retain'</code>.
</dl>

### Examples
```html
<body>
  <p>Apple-eaters eat thousands of apples a day.</p>
</body>
```

```javascript
Fibre( document.body ).wrap( /\bapple(s)?\b/gi, 'em' )
```
Which results in:

```html
<body>
  <p><em>Apple</em>-eaters eat thousands of <em>apples</em> a day.</p>
</body>
```
Works with matches spread in different nodes,

```html
<body>
  <p><span>App</span>le-eaters eat thousands of apple<span class="pl">s</span> a day.</p>
</body>
```
Results in: 

```html
<body>
  <p><span><em>App</em></span><em>le</em>-eaters eat thousands of <em>apple</em><span class="pl"><em>s</em></span> a day.</p>
</body>
```

## Fibre.fn.replace()
The method replaces the matched text in the given context with a new string.

### Syntax
```javascript
fibre.replace( regexp|substr, newSubStr|function[, portionMode] )
```

### Parametres

<dl>
<dt><code>regexp</code>
<dd>A RegExp object. Text that matches will be replaced by the return value of parametre #2.

<dt><code>substr</code>
<dd>A String that is to be replaced by the return value of parametre #2.

<dt><code>newSubStr</code>
<dd> The String that replaces the substring received from parametre #1. Common replacement patterns supported.

<dt><code>function</code>
<dd>A callback function to be invoked and returns the new substring or node.

<dt><code>portionMode</code>
<dd><em>Optional</em>. String of either one of <code>'retain'</code> or <code>'first'</code>, which indicates whether to re-use the existing node boundaries when replacing a match text, or simply place the entire replacement in the first-found match portion's node. The default value is <code>'retain'</code>.
</dl>

### Examples 
```html
<article>
  <p>Th<span>is</span> paragraph is to be later replaced.</p>
</article>
```

```javascript
var fibre = Fibre( 'article' )

fibre
  .replace( /(\w+)/g, '*$1' )
  .replace( /\*this/ig, function( portion, match ) {
    var idx = portion.index
    return idx + match[ idx ].toUpperCase()  
  })
```

Will result in:

```html
<article>
  <p>*TH<span>IS</span> *paragraph *is *to *be *later *replaced.</p>
</article>
```

## Fibre.fn.filter()
The method filters the nodes in the given context and decides whether the nodes *will* later apply the wrap/replace method.

### Syntax
```javascript
fibre.filter( selector|function )
```

### Parametres
<dl>
<dt><code>selector</code>
<dd>A String containing one or more CSS selector(s) to filter the matched nodes while traversing.

<dt><code>function</code>
<dd>A function that will be invoked on every match, which receives one parametre <code>currentNode</code> indicating the node the matched text is for filtering usage. By assigning a function to the parametre #1 affects the <code>filterOut()</code> method as well.
</dl>

### Examples
```html
<div id="test">
  <p>This <span class="be">is</span> a simple test.</p>
</div>

<script>
 var test = 'This is a simple test.' 
</script>
```

```javascript
Fibre( document.getElementById( 'test' ))
  .wrap( /is/gi, 'b' )
  .filter( '.be' )
  .wrap( /is/gi, 'em' ) 
```

Will result in:

```html
<div id="test">
  <p>Th<b>is</b> <span class="be"><b><em>is</em></b></span> a simple test.</p>
</div>

<script>
 var test = 'This is a simple test.' 
</script>
```
**Note:** The matched text inside `script` element isn't altered for Fibre defaultly filters out `script`, `style` and `head title` elements. Reset the default filter-out selectors via `Fibre.fn.filterOut`.

## Fibre.fn.filterOut()
The method filters *out* the nodes in the given context and decides whether the nodes *will* later apply the wrap/replace method.

### Syntax
```javascript
fibre.filterOut( selector, boolExtend )
```

### Parametres
<dl>
<dt><code>selector</code>
<dd>A String containing one or more CSS selector(s) to filter <em>out</em> the matched nodes while traversing.

<dt><code>boolExtend</code>
<dd><em>Optional.</em> A boolean indicating whether to extend the current selector (<code>true</code>, <code>style, script, head title</code> from the prototype object) or to override the selector entirely (<code>false</code>). Defaultly <code>false</code>.
</dl>

### Examples
```html
<div id="test">
  <p>This <span class="be">is</span> a simple test.</p>
</div>

<script>
 var test = 'This is a simple test.' 
</script>
```

```javascript
Fibre( document.getElementById( 'test' ))
  .wrap( /is/gi, 'span' )
  .filterOut( '.be' )
  .replace( /is/gi, 'IZZ' ) 
```

Will result in:
```html
<div id="test">
  <p>Th<b>IZZ</b> <span class="be"><b>is</b></span> a simple test.</p>
</div>

<script>
 var test = 'ThIZZ IZZ a simple test.' 
</script>
```

## Fibre.fn.revert()
The method reverts the finder by a given level.

### Syntax
```javascript
fibre.revert( [level] )
```

### Parametres
<dl>
<dt><code>level</code>
<dd><em>Optional.</em> A Number or a String whose value is <code>'all'</code> indicating the finder level to revert. The default value is <code>1</code>.
</dl>

### Examples
```javascript
var fibre = Fibre( document.getElementById( 'test' ))
  .replace( /\bis\b/gi, 'isn\'t' )
  .wrap( /\bwill\b/gi, 'span' )

// Later,
fibre.revert( 'all' )
```

#### Description
The last line of the script above will revert the context (`document.getElementById( 'test' )`) back to the state before any replace or wrap method has executed.

## Fibre.matches()
The method compares and returns whether a given node matches the given CSS selectors.

### Syntax
```javascript 
Fibre.matches( node, selector, bypassNodeType39 )
```

<dl>
<dt><code>node</code>
<dd>A node object to compare. 

<dt><code>selector</code>
<dd>A string of CSS selectors to check if the node matches.

<dt><code>bypassNodeType39</code>
<dd><em>Optional.</em> A boolean that decides whether to always return `true` for Document or Text nodes.
</dl>

### Examples
```html
<!doctype html>
<html lang="en">
  <head>
  </head>
  <body class="post">
  </body>
</html>
```

```javascript 
Fibre.matches( document.body, 'body.index, body.post' )  // returns true
Fibre.matches( document.documentElement, '[lang="es"]' ) // returns false 
Fibre.matches( document, 'style' )                       // returns false
Fibre.matches( document, 'style', true )                 // returns true
```

