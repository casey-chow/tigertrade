package main

import (
	"bufio"
	"fmt"
	"github.com/casey-chow/tigertrade/server"
	"log"
	"net/http"
	"os"
	"strings"
)

// Manually loads config variables from .env file if they are not already.
// This is a workaround because we're not starting the app with heroku local.
func loadEnvironment() {
	if os.Getenv("CONFIG_PRESENT") == "true" {
		return
	}
	log.Print("Heroku config variables not present. Loading manually from .env")

	// Open .env file
	file, err := os.Open("./.env")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)

	// set each enclosed config var in environment
	for scanner.Scan() {
		args := strings.Split(scanner.Text(), "=")
		os.Setenv(args[0], args[1])
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}

}

func main() {
	loadEnvironment()
	app := server.App()

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT not set correctly.")
	}
	fmt.Printf("Listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, app))
}
