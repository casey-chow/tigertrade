package main

import (
	"fmt"
	"github.com/casey-chow/tigertrade/server"
	"log"
	"net/http"
)

func main() {
	app := server.App()

	fmt.Print("Listening on port 3000\n")
	log.Fatal(http.ListenAndServe(":3000", app))
}
