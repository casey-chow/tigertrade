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
	router.GET("/api/listings", ServeListings)
	router.POST("/api/listings", ServeAddListing)
	router.GET("/api/listings/:id", ServeListingById)
	router.POST("/api/listings/:id", ServeUpdateListingById)

	router.GET("/api/listings/:id/photos", ServePhotosByListingId)
	//	router.POST("/api/listings/:id/photos", ServeAddPhoto)
	//	router.GET("/api/listings/:lid/photos/:pid", ServePhotoById)
	//	router.POST("/api/listings/:lid/photos/:pid", ServeUpdatePhotoById)

	router.GET("/api/seeks", ServeRecentSeeks)
	router.POST("/api/seeks", ServeAddSeek)
	router.GET("/api/seeks/:id", ServeSeekById)
	//	router.POST("/api/seeks/:id", ServeUpdateSeekById)

	router.GET("/api/savedsearches", ServeRecentSavedSearches)
	router.POST("/api/savedsearches", ServeAddSavedSearch)
	router.GET("/api/savedsearches/:id", ServeSavedSearchById)
	//	router.POST("/api/savedsearches/:id", ServeUpdateSavedSearchById)

	return router
}
