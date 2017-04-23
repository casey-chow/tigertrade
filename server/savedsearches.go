package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

// Writes the most recent count saved searches, based on original date created to w
func ReadSavedSearches(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		Error(w, 401)
		return
	}

	savedSearches, err, code := models.ReadSavedSearches(db, user.KeyID, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while reading recent or queried saved searches")
		Error(w, code)
		return
	}

	Serve(w, savedSearches)
}

// Writes the most recent count saved searches, based on original date created to w
func ReadSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		Error(w, 404)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		Error(w, 401)
		return
	}

	savedSearches, err, code := models.ReadSavedSearch(db, id, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting saved search by ID")
		Error(w, code)
		return
	}

	Serve(w, savedSearches)
}

func CreateSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get saved search to add from request body
	savedSearch := models.SavedSearch{}
	err := ParseJSONFromBody(r, &savedSearch)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON file")
		Error(w, 500)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		Error(w, 401)
		return
	}

	savedSearch, err, code := models.CreateSavedSearch(db, savedSearch, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting adding saved search")
		Error(w, code)
		return
	}

	Serve(w, savedSearch)
}

func UpdateSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		Error(w, 404)
		return
	}

	// Get savedSearch to add from request body
	savedSearch := models.SavedSearch{}
	err := ParseJSONFromBody(r, &savedSearch)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON file")
		Error(w, 500)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		Error(w, 401)
		return
	}

	savedSearch, err, code := models.UpdateSavedSearch(db, id, savedSearch, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while updating savedSearch by ID")
		Error(w, code)
		return
	}

	Serve(w, savedSearch)
}

func DeleteSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		Error(w, 404)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		Error(w, 401)
		return
	}

	err, code := models.DeleteSavedSearch(db, id, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while deleting savedSearch by ID")
		Error(w, code)
		return
	}
}
