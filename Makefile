# Tigertrade Makefile

# VARIABLES
#######################################
BIN = $(GOPATH)/bin
IMPORT_PATH = $(shell pwd)

FRESH = $(BIN)/fresh
GOVENDOR = $(BIN)/govendor
GOCONVEY = $(BIN)/goconvey
GOLINT = $(BIN)/golint

default: build-server
install: install-server install-client

# ENVIRONMENT
#######################################

.env:
	cp .env.example .env

$(FRESH):
	go get github.com/pilu/fresh

$(GOCONVEY):
	go get github.com/smartystreets/goconvey

$(GOVENDOR):
	go get github.com/kardianos/govendor

$(GOLINT):
	go get github.com/golang/lint/golint

dev: .env $(GOVENDOR) $(GOCONVEY) $(FRESH) $(GOLINT)
	cp hooks/* .git/hooks

# SERVER
#######################################

install-server: $(GOVENDOR)
	$(GOVENDOR) sync -v

build-server: $(FRESH) clean
	go build

serve: $(FRESH) clean
	$(FRESH)


# CLIENT
#######################################

install-client:
	$(! command -v yarn && npm install --global yarn)
	yarn install

build-client:
	yarn build

serve-client:
	yarn start


# TESTING
#######################################

vet:
	go vet github.com/casey-chow/tigertrade/server/...
	go vet github.com/casey-chow/tigertrade/server

lint: $(GOLINT)
	golint . server/...

test:
	go test github.com/casey-chow/tigertrade/server

test-watch: $(GOCONVEY)
	$(GOCONVEY)


# CLEANUP
#######################################

# Removes all temporary files
clean:
	rm -rf tmp/
	rm -rf client/build/

# Removes installed dependencies.
purge: clean
	rm -rf vendor/*/
	rm -rf node_modules/
	rm .git/hooks/*

