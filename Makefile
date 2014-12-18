
all ::
	make dist

dep ::
	rm -rf ./findAndReplaceDOMText
	git clone --depth 1 https://github.com/padolsey/findAndReplaceDOMText.git

fardt.js ::
	node build/compile-dep.js

dist ::
	gulp build

