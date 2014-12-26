(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
  var test, module, doc, div, convertHtml, htmlEqual;
  test = QUnit.test;
  module = QUnit.module;
  doc = function(){
    return document.cloneNode(true);
  };
  div = function(){
    return document.createElement('div');
  };
  convertHtml = function(html){
    return html.toLowerCase().replace(/[\r\n]/g, '').replace(/="([^"]+)"/g, '=$1');
  };
  htmlEqual = function(a, b, log){
    a = convertHtml(a);
    b = convertHtml(b);
    return equal(a, b, log);
  };
  module('Basics');
  test('Element boundary arsenal', function(assert){
    var d, test, before, after, f;
    d = div();
    test = {
      'TEST': '<x>TEST</x>',
      'T<em>EST</em>': '<x>T</x><em><x>EST</x></em>',
      '<div>TEST</div>': '<div><x>TEST</x></div>',
      '<i>T</i><b>E</b><u>S</u><i>T</i>': '<i><x>T</x></i><b><x>E</x></b><u><x>S</x></u><i><x>T</x></i>',
      '<i>T</i><u>EST ok</u>': '<i><x>T</x></i><u><x>EST</x> ok</u>',
      '<i>ok T</i><em>EST</em>': '<i>ok <x>T</x></i><em><x>EST</x></em>',
      '<i>ok <i><b>T</b></i></i><em>EST</em>': '<i>ok <i><b><x>T</x></b></i></i><em><x>EST</x></em>'
    };
    for (before in test) {
      after = test[before];
      d.innerHTML = before;
      Fibre(d).wrap(/TEST/, 'x');
      htmlEqual(d.innerHTML, after);
      d.innerHTML = before;
      f = Fibre(d).wrap(/TEST/g, 'x');
      htmlEqual(d.innerHTML, after);
      f.revert();
      htmlEqual(d.innerHTML, before);
    }
  });
  module('Findings');
  test('String matches', function(){
    var before, d;
    before = 'this is a ??te<i>st</i>';
    d = div();
    d.innerHTML = before;
    Fibre(d).wrap('??test', 'x');
    htmlEqual(d.innerHTML, 'this is a <x>??te</x><i><x>st</x></i>');
  });
  test('Variable length RegExp matches', function(){
    var d, i$, i;
    d = div();
    for (i$ = 0; i$ < 100; ++i$) {
      i = i$;
      d.innerHTML = Array(i + 1).join('<em>x</em>');
      Fibre(d).wrap(/x+/, 'z');
      htmlEqual(d.innerHTML, Array(i + 1).join('<em><z>x</z></em>'));
    }
  });
  test('Specified group', function(){
    var before, d, r1, r2, r3;
    before = 'TEST TESThello testhello TESThello';
    d = div();
    r1 = /(TEST)hello/;
    r2 = /(TEST)hello/g;
    r3 = /\s(TEST)(hello)/gi;
    d.innerHTML = before;
    Fibre(d).wrap(r1, 'x').replace(r1, '$1');
    htmlEqual(d.innerHTML, 'TEST <x>TEST</x> testhello TESThello');
    Fibre(d).wrap(r2, 'x').replace(r2, '$1');
    htmlEqual(d.innerHTML, 'TEST <x>TEST</x> testhello <x>TEST</x>');
    d.innerHTML = before;
    Fibre(d).wrap(r3, 'x').replace(r3, '$2');
    htmlEqual(d.innerHTML, 'TEST<x>hello</x><x>hello</x><x>hello</x>');
  });
  test('Word boundaries', function(){
    var before, d;
    before = 'a go matching at test wordat at';
    d = div();
    d.innerHTML = before;
    Fibre(d).wrap(/\bat\b/g, 'x');
    htmlEqual(d.innerHTML, 'a go matching <x>at</x> test wordat <x>at</x>');
  });
  module('Replacement');
  test('Basic text', function(){
    var before, d;
    before = 'This <span class="be">is</span> a text run for replacement.';
    d = div();
    d.innerHTML = before;
    Fibre(d).replace(/is\b/gi, 'IZZ');
    htmlEqual(d.innerHTML, 'ThIZZ <span class="be">IZZ</span> a text run for replacement.');
  });
  test('With newly-generated nodes', function(){
    var before, d;
    before = 'This <span class="be">is</span> a text run for replacement.';
    d = div();
    d.innerHTML = before;
    Fibre(d).wrap(/is\b/gi, document.createElement('span'));
    htmlEqual(d.innerHTML, 'Th<span>is</span> <span class="be"><span>is</span></span> a text run for replacement.', 'Wrap');
    d.innerHTML = before;
    Fibre(d).replace(/is\b/gi, function(portion){
      var span;
      span = document.createElement('span');
      span.className = 'test';
      span.appendChild(document.createTextNode(portion.text));
      return span;
    });
    htmlEqual(d.innerHTML, 'Th<span class="test">is</span> <span class="be"><span class="test">is</span></span> a text run for replacement.', 'Replace');
  });
  test('Custom replacement function', function(){
    var before, d, r1, r2;
    before = '<span>v</span><span>v</span><span>v</span><span>v</span><span>v</span>';
    d = div();
    r1 = /v+/gi;
    d.innerHTML = before;
    Fibre(d).replace(r1, function(portion){
      return document.createTextNode('aeiou'[portion.index]);
    });
    htmlEqual(d.innerHTML, '<span>a</span><span>e</span><span>i</span><span>o</span><span>u</span>');
    before = '4321 1234 5678 abcd';
    r2 = /\w{4}/g;
    d.innerHTML = before;
    Fibre(d).replace(r2, function(portion, mat){
      return mat[0].split('').reverse().join('') + '?';
    });
    htmlEqual(d.innerHTML, '1234? 4321? 8765? dcba?');
  });
  module('Filtering');
  test('Default filtering', function(){
    var before, d, r, fibre;
    before = 'This <b class="be">is</b> a text run for the test.   <style>.test{}</style>  <script>test()</script>';
    d = div();
    r = /te([sx])t/gi;
    d.innerHTML = before;
    fibre = Fibre(d);
    fibre.wrap(r, 'x').replace(r, 'TE$1T');
    htmlEqual(d.innerHTML, 'This <b class="be">is</b> a <x>TExT</x> run for the <x>TEsT</x>.   <style>.test{}</style>  <script>test()</script>');
  });
  test('Filtering nodes with custom CSS selectors', function(){
    var before, d;
    before = '<b>test</b>, <i>test</i>, <u>test</u>';
    d = div();
    d.innerHTML = before;
    Fibre(d).filter('div, b, i').wrap(/test/g, 'x');
    htmlEqual(d.innerHTML, '<b><x>test</x></b>, <i><x>test</x></i>, <u>test</u>');
  });
  test('Filtering out with extended selectors', function(){
    var before, d, r, fibre;
    before = 'This <b class="be">is</b> a text run for the test.   <style>.is{}</style>  <script>is()</script>';
    d = div();
    r = /is/gi;
    d.innerHTML = before;
    fibre = Fibre(d);
    fibre.wrap(r, 'x').filterOut('.be').wrap(r, 'y');
    htmlEqual(d.innerHTML, 'Th<x><y>is</y></x> <b class="be"><x>is</x></b> a text run for the test.   <style>.<y>is</y>{}</style>  <script><y>is</y>()</script>');
    d.innerHTML = before;
    fibre = Fibre(d);
    fibre.wrap(r, 'x').filterOut('.be', true).wrap(r, 'y');
    htmlEqual(d.innerHTML, 'Th<x><y>is</y></x> <b class="be"><x>is</x></b> a text run for the test.   <style>.is{}</style>  <script>is()</script>');
  });
  test('Custom filtering function', function(){
    var before, d, r, fibre;
    before = '<p>This <b class="be">is</b> a text run for <b><i>the</i></b> <b>test</b>.';
    d = div();
    r = /\b(\w+)\b/g;
    d.innerHTML = before;
    fibre = Fibre(d);
    fibre.filter(function(currentNode){
      return !/^(is|the)$/i.test(currentNode.textContent);
    }).wrap(r, 'y');
    htmlEqual(d.innerHTML, '<p><y>This</y> <b class="be">is</b> <y>a</y> <y>text</y> <y>run</y> <y>for</y> <b><i>the</i></b> <b><y>test</y></b>.</p>');
  });
  module('Revert');
  test('Revert mechanism', function(){
    var before, after, d, r, fibre;
    before = 'Hello, there!';
    after = 'Hello, <x>world</x>!';
    d = div();
    r = /\bthere\b/gi;
    d.innerHTML = before;
    fibre = Fibre(d).wrap(r, 'x').replace(r, 'world');
    htmlEqual(d.innerHTML, after, 'Before the revert');
    try {
      fibre.revert('all');
    } catch (e$) {}
    htmlEqual(d.innerHTML, before, 'Rightfully reverted');
    fibre.wrap(r, 'x').replace(r, 'world');
    htmlEqual(d.innerHTML, after, 'Post-revert wrap/replace');
  });
  module('Portion mode');
  test('Portion mode: first', function(){
    var before, d;
    before = 'Testing 123 HE<em>LLO there</em>';
    d = div();
    d.innerHTML = before;
    Fibre(d).wrap(/hello/i, 'span', 'first');
    htmlEqual(d.innerHTML, 'Testing 123 <span>HELLO</span><em> there</em>', 'Wrap');
    d.innerHTML = before;
    Fibre(d).replace(/hello/i, 'hola', 'first');
    htmlEqual(d.innerHTML, 'Testing 123 hola<em> there</em>', 'Replace');
  });
  test('Portion mode: retain', function(){
    var before, d, fibre;
    before = 'Testing 123 HE<em>LLO there</em>';
    d = div();
    d.innerHTML = before;
    fibre = Fibre(d).wrap(/hello/i, 'span', 'retain');
    htmlEqual(d.innerHTML, 'testing 123 <span>he</span><em><span>llo</span> there</em>', 'Wrap');
    d.innerHTML = before;
    Fibre(d).replace(/hello/i, 'hola', 'retain');
    htmlEqual(d.innerHTML, 'Testing 123 ho<em>la there</em>', 'Replace');
  });
}).call(this);

},{}]},{},[1])