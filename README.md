
# Fibre
## Overview
Fibre is a small library based on [`FindAndReplaceDOMText`](fardt). It searches for the regular expression matches in a given context (a DOM node) and replaces/wraps each one of them with a new text run or a new DOM node. *Chaining syntax supported.*

[fardt]: https://github.com/padolsey/findAndReplaceDOMText

## Syntax

```javascript
var fibre = Fibre( context )
  .replace( regexp, newSubStr )
  .filterOut( selector )
  .wrap( regexp, newDOMObj )
  …
  .revert( level )
```

## Examples

```html
<body>
  Explaining how to write a replace <b>func</b>tion
</body>
```

```javascript
var fib_body = Fibre( document.body )
  .wrap( /apple[s]?/, 'em' )
```
