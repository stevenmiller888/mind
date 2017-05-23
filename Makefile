SRC := index.js
TESTS := test.js

test: node_modules
	./node_modules/.bin/ava

coverage: $(SRC) $(TESTS) node_modules
	./node_modules/.bin/nyc --reporter=lcov --reporter=html ./node_modules/.bin/ava

node_modules: package.json
	yarn
	touch $@

clean:
	rm -rf coverage .nyc_output

.PHONY: test clean
