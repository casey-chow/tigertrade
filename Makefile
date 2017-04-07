# Tigertrade Makefile
default: run
.PHONY: run install

run:
	revel run github.com/TheGuyWithTheFace/tigertrade

# Simplifies, overwrites and prints the filename of any file with "bad" formatting.
fmt:
	gofmt -s -l -w .

install:
	govendor sync
