package server

import (
	"fmt"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

// Index serves a welcome page
func index(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprint(w, "Welcome!")
}

// Router returns the router http handler for the package
func Router() http.Handler {
	router := httprouter.New()

	router.GET("/", index)

	// users.go
	router.GET("/api/users/redirect", RedirectUser)
	router.GET("/api/users/logout", LogoutUser)
	router.GET("/api/users/current", GetCurrentUser)

	// listings.go
	router.GET("/api/listings", ReadListings)
	router.POST("/api/listings", CreateListing)
	router.GET("/api/listings/:id", ReadListing)
	router.PUT("/api/listings/:id", UpdateListing)
	router.PUT("/api/listings/:id/star", UpdateListingStar)
	router.DELETE("/api/listings/:id", DeleteListing)
	router.POST("/api/listings/:id/contact", ContactListing)

	// seeks.go
	router.GET("/api/seeks", ReadSeeks)
	router.POST("/api/seeks", CreateSeek)
	router.GET("/api/seeks/:id", ReadSeek)
	router.PUT("/api/seeks/:id", UpdateSeek)
	router.DELETE("/api/seeks/:id", DeleteSeek)
	router.POST("/api/seeks/:id/contact", ContactSeek)

	// savedsearches.go
	router.GET("/api/watches", ReadSavedSearches)
	router.POST("/api/watches", CreateSavedSearch)
	router.GET("/api/watches/:id", ReadSavedSearch)
	router.PUT("/api/watches/:id", UpdateSavedSearch)
	router.DELETE("/api/watches/:id", DeleteSavedSearch)

	// photos.go
	router.POST("/api/photos", CreatePhoto)

	return router
}
