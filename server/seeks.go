package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

// Writes the most recent count seeks, based on original date created to w
func ReadSeeks(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	seeks, err, code := models.ReadSeeks(db, truncationLength, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting recent seeks")
		http.Error(w, http.StatusText(code), code)
		return
	}

	Serve(w, seeks)
}

// Writes the most recent count seeks, based on original date created to w
func ReadSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		http.Error(w, "", 404)
		return
	}

	seeks, err, code := models.ReadSeek(db, id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting seek by ID")
		http.Error(w, http.StatusText(code), code)
		return
	}

	Serve(w, seeks)
}

func CreateSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get seek to add from request body
	seek := models.Seek{}
	err := ParseJSONFromBody(r, &seek)
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

	seek, err, code := models.CreateSeek(db, seek, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while adding new seek")
		http.Error(w, http.StatusText(code), code)
		return
	}

	Serve(w, seek)
}
