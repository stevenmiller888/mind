
#
# Binaries.
#

BIN := ./node_modules/.bin
ESLINT := $(BIN)/eslint
MOCHA := $(BIN)/mocha

#
# Default.
#

default: node_modules test-style

#
# Test.
#

test: node_modules
	@$(MOCHA) test --reporter spec
		
#
# Test style.
#

test-style:
	@$(ESLINT) .

#
# Dependencies.
#

node_modules: package.json
	@npm install

#
# Clean.
#

clean:
	@rm -rf *.log
	
#
# Clean dependencies.
#

clean-deps:
	@rm -rf node_modules

#
# Phonies.
#

.PHONY: test test-style