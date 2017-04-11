package server

import (
	"fmt"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

func Index(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprint(w, "Welcome!")
}

func Hello(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	fmt.Fprintf(w, "hello, %s!\n", ps.ByName("name"))
}

// Router returns the router http handler for the package.
func Router() http.Handler {
	router := httprouter.New()

	router.GET("/", Index)
	router.GET("/hello/:name", Hello)

	// Authentication Routes
	router.GET("/user/redirect", RedirectUser)
	router.GET("/user/logout", LogoutUser)
	router.GET("/user/current", GetCurrentUser)

	// API Routes
	router.GET("/api/listings", ServeRecentListings)
	router.GET("/api/listings/:id", ServeListingById)
	router.GET("/api/listings/:id/photos", ServePhotosByListingId)

	return router
}
