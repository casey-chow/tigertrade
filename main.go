package main

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server"
	"net/http"
	"os"
)

func main() {
	app := server.App()

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT not set correctly.")
	}
	log.Printf("Listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, app))
}
