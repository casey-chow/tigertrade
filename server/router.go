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
	router.GET("/api/users/redirect", RedirectUser)
	router.GET("/api/users/logout", LogoutUser)
	router.GET("/api/users/current", ServeCurrentUser)

	// API Routes
	router.GET("/api/listings", ServeRecentListings)
	router.POST("/api/listings", ServeAddListing)
	router.GET("/api/listings/:id", ServeListingById)
	router.GET("/api/listings/:id/photos", ServePhotosByListingId)

	router.GET("/api/seeks", ServeRecentSeeks)
	router.POST("/api/seeks", ServeAddSeek)
	router.GET("/api/seeks/:id", ServeSeekById)

	router.GET("/api/savedsearches", ServeRecentSavedSearches)
	router.POST("/api/savedsearches", ServeAddSeek)
	router.GET("/api/savedsearches/:id", ServeSeekById)

	router.GET("/api/search/:query", ServeSearch)

	return router
}
