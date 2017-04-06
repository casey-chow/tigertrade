# Tigertrade Makefile
default: run
.PHONY: run install

run:
	revel run github.com/TheGuyWithTheFace/tigertrade

install:
	govendor sync