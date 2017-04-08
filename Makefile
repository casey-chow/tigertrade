# Tigertrade Makefile
default: run
.PHONY: run run-client install client

run: client
	revel run github.com/TheGuyWithTheFace/tigertrade

# Simplifies, overwrites and prints the filename of any file with "bad" formatting.
fmt:
	gofmt -s -l -w .

install:
	govendor sync

# Removes all temporary files.
clean:
	revel clean github.com/TheGuyWithTheFace/tigertrade

# Removes all temporary files, including installed dependencies.
purge: clean
	rm -rf vendor/*/
