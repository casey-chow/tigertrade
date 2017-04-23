package server

import (
	"fmt"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

func Index(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprint(w, "Welcome!")
}

// Router returns the router http handler for the package.
func Router() http.Handler {
	router := httprouter.New()

	router.GET("/", Index)

	// users.go
	router.GET("/api/users/redirect", RedirectUser)
	router.GET("/api/users/logout", LogoutUser)
	router.GET("/api/users/current", ServeCurrentUser)

	// listings.go
	router.GET("/api/listings", ServeListings)
	router.POST("/api/listings", ServeAddListing)
	router.GET("/api/listings/:id", ServeListingById)
	router.POST("/api/listings/:id", ServeUpdateListingById)
	//	router.DELETE("/api/listings/:id", ServeDeleteListingById)

	// photos.go
	router.GET("/api/listings/:id/photos", ServePhotosByListingId)
	//	router.POST("/api/listings/:id/photos", ServeAddPhoto)
	//	router.GET("/api/listings/:lid/photos/:pid", ServePhotoById)
	//	router.POST("/api/listings/:lid/photos/:pid", ServeUpdatePhotoById)

	// seeks.go
	router.GET("/api/seeks", ServeRecentSeeks)
	router.POST("/api/seeks", ServeAddSeek)
	router.GET("/api/seeks/:id", ServeSeekById)
	//	router.POST("/api/seeks/:id", ServeUpdateSeekById)

	// savedsearches.go
	router.GET("/api/savedsearches", ServeRecentSavedSearches)
	router.POST("/api/savedsearches", ServeAddSavedSearch)
	router.GET("/api/savedsearches/:id", ServeSavedSearchById)
	//	router.POST("/api/savedsearches/:id", ServeUpdateSavedSearchById)

	return router
}
