package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

// ReadSavedSearches performs a request for the current user's saved searches, and writes them to w
func ReadSavedSearches(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	query := models.NewSavedSearchQuery()

	// Get limit from params
	if limit, err := strconv.ParseUint(r.URL.Query().Get("limit"), 10, 64); err == nil && limit != 0 {
		query.Limit = limit
	}

	if offset, err := strconv.ParseUint(r.URL.Query().Get("offset"), 10, 64); err == nil {
		query.Offset = offset
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}
	query.UserID = user.KeyID

	savedSearches, code, err := models.ReadSavedSearches(db, query)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while reading recent or queried saved searches")
		Error(w, code)
		return
	}

	Serve(w, savedSearches)
}

// ReadSavedSearch writes a saved search identified in r to w
func ReadSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusBadRequest)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	savedSearches, code, err := models.ReadSavedSearch(db, id, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while getting saved search by ID")
		Error(w, code)
		return
	}

	Serve(w, savedSearches)
}

// CreateSavedSearch creates a new saved search based on the contents of r, owned by the current user,
// and then writes it to w with its keyId set
func CreateSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get saved search to add from request body
	savedSearch := models.SavedSearch{}
	err := ParseJSONFromBody(r, &savedSearch)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while parsing JSON file")
		Error(w, http.StatusUnprocessableEntity)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	savedSearch, code, err := models.CreateSavedSearch(db, savedSearch, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while getting adding saved search")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusCreated)
	Serve(w, savedSearch)
}

// UpdateSavedSearch updates the requested saved search if it is owned by the current user
func UpdateSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusBadRequest)
		return
	}

	// Get savedSearch to add from request body
	savedSearch := models.SavedSearch{}
	err := ParseJSONFromBody(r, &savedSearch)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while parsing JSON file")
		Error(w, http.StatusUnprocessableEntity)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	if code, err := models.UpdateSavedSearch(db, id, savedSearch, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while updating savedSearch by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DeleteSavedSearch delete the requested saved search if it is owned by the current user
func DeleteSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusBadRequest)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	if code, err := models.DeleteSavedSearch(db, id, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while deleting savedSearch by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
