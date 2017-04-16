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

// Writes the most recent count seeks, based on original date created to w
func ServeRecentSeeks(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	seeks, err, code := models.GetRecentSeeks(db, truncationLength, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting recent seeks")
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, seeks)
}

// Writes the most recent count seeks, based on original date created to w
func ServeSeekById(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		http.Error(w, "", 404)
		return
	}

	seeks, err, code := models.GetSeekById(db, id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting seek by ID")
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, seeks)
}

func ServeAddSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get seek to add from request body
	seek := models.Seek{}
	// TODO this fails silently for some reason if r.Body contains invalid JSON
	json.NewDecoder(r.Body).Decode(&seek)

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while authenticating user: not authorized")
		http.Error(w, http.StatusText(401), 401)
		return
	}

	seek, err, code := models.AddSeek(db, seek, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while adding new seek")
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, seek)
}
