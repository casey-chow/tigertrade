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
func ServeRecentSavedSearches(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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
		http.Error(w, http.StatusText(401), 401)
		return
	}

	savedSearches, err, code := models.GetRecentSavedSearches(db, user.KeyID, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting recent saved searches")
		http.Error(w, http.StatusText(code), code)
		return
	}

	Serve(w, savedSearches)
}

// Writes the most recent count saved searches, based on original date created to w
func ServeSavedSearchById(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		http.Error(w, "", 404)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		http.Error(w, http.StatusText(401), 401)
		return
	}

	savedSearches, err, code := models.GetSavedSearchById(db, id, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting saved search by ID")
		http.Error(w, http.StatusText(code), code)
		return
	}

	Serve(w, savedSearches)
}

func ServeAddSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get saved search to add from request body
	savedSearch := models.SavedSearch{}
	err := ParseJSONFromBody(r, &savedSearch)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON file")
		http.Error(w, http.StatusText(500), 500)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		http.Error(w, http.StatusText(401), 401)
		return
	}

	savedSearch, err, code := models.AddSavedSearch(db, savedSearch, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting adding saved search")
		http.Error(w, http.StatusText(code), code)
		return
	}

	Serve(w, savedSearch)
}
