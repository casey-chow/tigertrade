package main

import (
	"fmt"
	"github.com/casey-chow/tigertrade/server"
	"log"
	"net/http"
)

func main() {
	router := server.RouterEngine()

	fmt.Printf("Listening on port 3000")
	log.Fatal(http.ListenAndServe(":3000", router))
}
