package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

// Writes the most recent count listings, based on original date created to w
func ReadListings(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get limit from params
	limitStr := r.URL.Query().Get("limit")
	limit := defaultNumResults

	var e error
	if limitStr != "" {
		limit, e = strconv.Atoi(limitStr)
		if e != nil || limit == 0 {
			limit = defaultNumResults
		}
	}
	if limit > maxNumResults {
		limit = maxNumResults
	}

	// Get optional search query from params
	queryStr := r.URL.Query().Get("query")

	listings, err, code := models.ReadListings(db, queryStr, truncationLength, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while reading recent or queried listings")
		Error(w, code)
		return
	}

	Serve(w, listings)
}

// Writes the most recent count listings, based on original date created to w
func ReadListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusNotFound)
		return
	}

	listings, err, code := models.ReadListing(db, id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting listing by ID")
		Error(w, code)
		return
	}

	Serve(w, listings)
}

func CreateListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get listing to add from request body
	listing := models.Listing{}
	err := ParseJSONFromBody(r, &listing)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON file")
		Error(w, http.StatusInternalServerError)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	listing, err, code := models.CreateListing(db, listing, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while adding new listing")
		Error(w, code)
		return
	}

	Serve(w, listing)
}

func UpdateListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusNotFound)
		return
	}

	// Get listing to add from request body
	listing := models.Listing{}
	err := ParseJSONFromBody(r, &listing)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON file")
		Error(w, http.StatusInternalServerError)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	listing, err, code := models.UpdateListing(db, id, listing, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while updating listing by ID")
		Error(w, code)
		return
	}

	Serve(w, listing)
}

func DeleteListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusNotFound)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	err, code := models.DeleteListing(db, id, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while deleting listing by ID")
		Error(w, code)
		return
	}
}
