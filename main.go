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
	log.WithFields(log.Fields{
		"port": port,
	}).Printf("server is now listening")
	log.Fatal(http.ListenAndServe(":"+port, app))
}
