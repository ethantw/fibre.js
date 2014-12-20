
# Fibre.js
Fibre.js is a small library based on [`FindAndReplaceDOMText`][fardt] by [James Padolsey][jp], with extra syntax sugar.

It searches for the regular expression matches in a given context (a DOM node) and replaces/wraps each one of them with a new text run or a new DOM node. 

*Chaining & string-like syntax supported.*

[fardt]: https://github.com/padolsey/findAndReplaceDOMText
[jp]: http://james.padolsey.com

## Install
- NPM `npm i fibre.js --save`
- Bower `bower install git://github.com/ethantw/fibre.js`

## Browser support
Fibre.js works on all *modern* browsers with no legacy support for older IE.

## License
Fibre.js is licensed under MIT License.

# API
## Introduction 
The syntax is *as simple as jQuery!*

`Fibre` needs no `new` operator to create an instance. Assign *one* DOM node to the first parametre `context` to initialise. 

```javascript
var fibre = Fibre( context )

fibre
.doSth( … )
.doSthElse( … )
```

## Fibre.fn.wrap()
The `wrap()` method wraps an assigned node round the matched text in the given context.

### Syntax
```javascript
fibre.wrap( regexp|substr, strElemName|node )
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
The `replace()` method replaces the matched text in the given context with a new string.

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
  <p>
</article>
```

```javascript
// Native API
var fibre = Fibre( document.querySelector( 'article' ))

// Or, use jQuery
var fibre = Fibre( $( 'article' )[0] )

fibre
  .replace( /体/g, '體' )
  .replace( //g, function( portion, match ) {
  
  })

```

## Fibre.fn.filter()
The `filter()` method decides nodes that *will* later apply the wrap/replace method.

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

## Fibre.fn.filterOut()
The `filterOut()` method decides nodes that will later *not* apply the wrap/replace method.

### Syntax
```javascript
fibre.filterOut( selector, boolAppend )
```

### Parametres
<dl>
<dt><code>selector</code>
<dd>A String containing one or more CSS selector(s) to filter <em>out</em> the matched nodes while traversing.

<dt><code>boolAppend</code>
<dd>Optional. A boolean indicating whether to extend the current selector (<code>true</code>, <code>style, script, head title</code> from the prototype object) or to override the selector entirely (<code>false</code>). Defaultly <code>false</code>.
</dl>

## Fibre.fn.revert()
The `revert()` method reverts the finder with a given level.

### Syntax
```javascript
fibre.revert( [level] )
```

### Parametre
<dl>
<dt><code>level</code>
<dd>Optional. A Number or a String whose value is <code>'all'</code> indicating the finder level to revert. The default value is <code>1</code>.
</dl>

