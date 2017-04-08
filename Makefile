# Tigertrade Makefile

# VARIABLES
#######################################
BIN = $(GOPATH)/bin
IMPORT_PATH = $(shell pwd)

FRESH = $(BIN)/fresh
GOVENDOR = $(BIN)/govendor
GOCONVEY = $(BIN)/goconvey


# ENVIRONMENT
#######################################

$(FRESH):
	go get github.com/pilu/fresh

$(GOCONVEY):
	go get github.com/smartystreets/goconvey

$(GOVENDOR):
	go get github.com/kardianos/govendor

# SERVER
#######################################

# Installs all dependencies
install: $(GOVENDOR)
	$(GOVENDOR) sync

# Builds the server executable
build: $(FRESH) clean

# Serves the API server, rerendering
serve: $(FRESH) clean
	$(FRESH)

# TESTING
#######################################

test:
	go test github.com/casey-chow/tigertrade/server

test-server: $(GOCONVEY)
	$(GOCONVEY)

# CLEANUP
#######################################

# Removes all temporary files
clean:
	rm -rf tmp/

# Removes installed dependencies.
purge: clean
	rm -rf vendor/*/

