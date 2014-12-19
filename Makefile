
all ::
	make dist

dep ::
	rm -rf ./findAndReplaceDOMText
	git clone --depth 1 https://github.com/padolsey/findAndReplaceDOMText.git

fardt.js ::
	node build/compile-dep.js

qunit ::
	# ln node_modules/qunitjs/qunit/qunit.js test/qunit.js
	ln node_modules/qunitjs/qunit/qunit.css test/qunit.css

test/js ::
	browserify test/test.js -o test/main.js

dist ::
	gulp build

