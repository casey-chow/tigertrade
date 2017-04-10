package main

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server"
	"net/http"
	"os"
)

func main() {
	app := server.App()

	// port can be determined either by SERVER_PORT or PORT,
	// but we prefer SERVER_PORT because it's more specific
	var port string
	if port = os.Getenv("SERVER_PORT"); port == "" {
		port = os.Getenv("PORT")
	}
	if port == "" {
		log.Fatal("PORT not set correctly.")
	}

	log.WithFields(log.Fields{
		"port": port,
	}).Printf("server is now listening")
	log.Fatal(http.ListenAndServe(":"+port, app))
}
