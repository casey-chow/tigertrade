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
	query := models.NewSavedSearchQuery()

	// Get limit from params
	if limit, err := strconv.ParseUint(r.URL.Query().Get("limit"), 10, 64); err == nil && limit != 0 {
		query.Limit = limit
	}

	if offset, err := strconv.ParseUint(r.URL.Query().Get("offset"), 10, 64); err == nil {
		query.Offset = offset
	}

	// Retrieve UserID
	if user, err := models.GetUser(db, getUsername(r)); err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	} else {
		query.UserID = user.KeyID
	}

	savedSearches, err, code := models.ReadSavedSearches(db, query)
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
		Error(w, http.StatusNotFound)
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

	savedSearch, err, code := models.CreateSavedSearch(db, savedSearch, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting adding saved search")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusCreated)
	Serve(w, savedSearch)
}

func UpdateSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusNotFound)
		return
	}

	// Get savedSearch to add from request body
	savedSearch := models.SavedSearch{}
	err := ParseJSONFromBody(r, &savedSearch)
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

	if err, code := models.UpdateSavedSearch(db, id, savedSearch, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while updating savedSearch by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func DeleteSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	if err, code := models.DeleteSavedSearch(db, id, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while deleting savedSearch by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
