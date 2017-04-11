package server

import (
	"encoding/json"
	"fmt"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"log"
	"net/http"
)

func Index(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprint(w, "Welcome!")
}

func Hello(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	fmt.Fprintf(w, "hello, %s!\n", ps.ByName("name"))
}

// Converts v to a JSON string and writes to responsewriter. Writes an HTTP
// 500 error on error.
func Serve(w http.ResponseWriter, v interface{}) {
	// Convert photos to JSON, Return to client
	marshaled, err := json.Marshal(v)
	if err != nil {
		log.Print(err)
		raven.CaptureError(err, nil)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json;charset=utf-8")
	fmt.Fprint(w, string(marshaled))
}

// Router returns the router http handler for the package.
func Router() http.Handler {
	router := httprouter.New()

	router.GET("/", Index)
	router.GET("/hello/:name", Hello)

	// Authentication Routes
	router.GET("/user/redirect", RedirectUser)
	router.GET("/user/logout", LogoutUser)

	// API Routes
	router.GET("/api/listings", ServeRecentListings)
	router.GET("/api/listings/:id", ServeListingById)
	router.GET("/api/listings/:id/photos", ServePhotosByListingId)

	return router
}
