package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

// Writes all photos associated with a given listing's key id to w
func ServePhotosByListingId(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		http.Error(w, "", 404)
		return
	}

	// Retrieve photos by listing id
	photos, err, code := models.GetPhotosByListingId(db, id)
	if err != nil {
		log.WithField("err", err).Error("Error while getting photo by ID")
		raven.CaptureError(err, nil)
		http.Error(w, http.StatusText(code), code)
		return
	}

	// Write photos object to output
	Serve(w, photos)
}
