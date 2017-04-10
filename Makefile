# Tigertrade Makefile

# VARIABLES
#######################################
BIN = $(GOPATH)/bin
IMPORT_PATH = $(shell pwd)

FRESH = $(BIN)/fresh
GOVENDOR = $(BIN)/govendor
GOCONVEY = $(BIN)/goconvey

default: build
install: install-server install-client

# ENVIRONMENT
#######################################

.env:
	cp .env.example .env
	[ -f ~/drive/COS\ 333/env ] && cp ~/drive/COS\ 333/env .env

$(FRESH):
	go get github.com/pilu/fresh

$(GOCONVEY):
	go get github.com/smartystreets/goconvey

$(GOVENDOR):
	go get github.com/kardianos/govendor

dev: .env

# SERVER
#######################################

install-server: $(GOVENDOR)
	$(GOVENDOR) sync -v

build-server: $(FRESH) clean
	go build

serve: .env $(FRESH) clean
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

test:
	go test github.com/casey-chow/tigertrade/server

test-watch: $(GOCONVEY)
	$(GOCONVEY)


# CLEANUP
#######################################

# Removes all temporary files
clean:
	rm -rf tmp/

# Removes installed dependencies.
purge: clean
	rm -rf vendor/*/
	rm -rf node_modules/

