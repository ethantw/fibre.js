
all ::
	make dist

dep ::
	rm -rf ./findAndReplaceDOMText
	git clone --depth 1 https://github.com/padolsey/findAndReplaceDOMText.git

fardt.js ::
	node build/compile-dep.js

dist ::
	make fardt.js
	rm -rf dist
	mkdir dist
	cd src && cat intro.js fardt.js fibre.js outro.js > ../dist/fibre.js

