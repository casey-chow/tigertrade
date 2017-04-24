package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

// Writes all photos associated with a given listing's key id to w
func ReadListingPhotos(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get listing ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusNotFound)
		return
	}

	// Retrieve photos by listing id
	photos, err, code := models.ReadListingPhotos(db, id)
	if err != nil {
		log.WithField("err", err).Error("Error while getting photo by ID")
		raven.CaptureError(err, nil)
		Error(w, code)
		return
	}

	// Write photos object to output
	Serve(w, photos)
}
