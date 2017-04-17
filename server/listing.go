package server

import (
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

// Writes the most recent count listings, based on original date created to w
func ServeRecentListings(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	listings, err, code := models.GetRecentListings(db, truncationLength, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting recent listings")
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listings)
}

// Writes the most recent count listings, based on original date created to w
func ServeListingById(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		http.Error(w, "", 404)
		return
	}

	listings, err, code := models.GetListingById(db, id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting listing by ID")
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listings)
}

func ServeAddListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get listing to add from request body
	listing := models.Listing{}
	// TODO this fails silently for some reason if r.Body contains invalid JSON
	json.NewDecoder(r.Body).Decode(&listing)

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		http.Error(w, http.StatusText(401), 401)
		return
	}

	listing, err, code := models.AddListing(db, listing, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while adding new listing")
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listing)
}

func ServeUpdateListingById(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		http.Error(w, "", 404)
		return
	}

	// Get listing to add from request body
	listing := models.Listing{}
	// TODO this fails silently for some reason if r.Body contains invalid JSON
	json.NewDecoder(r.Body).Decode(&listing)

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		http.Error(w, http.StatusText(401), 401)
		return
	}

	listing, err, code := models.UpdateListingById(db, id, listing, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while updating listing by ID")
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listing)
}
