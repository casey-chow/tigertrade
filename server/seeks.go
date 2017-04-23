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

	// Get optional search query from params
	queryStr := r.URL.Query().Get("query")

	seeks, err, code := models.ReadSeeks(db, queryStr, truncationLength, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while reading recent or queried seeks")
		Error(w, code)
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
		Error(w, 404)
		return
	}

	seeks, err, code := models.ReadSeek(db, id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting seek by ID")
		Error(w, code)
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

	seek, err, code := models.CreateSeek(db, seek, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while adding new seek")
		Error(w, code)
		return
	}

	Serve(w, seek)
}

func UpdateSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		Error(w, 404)
		return
	}

	// Get seek to add from request body
	seek := models.Seek{}
	err := ParseJSONFromBody(r, &seek)
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

	seek, err, code := models.UpdateSeek(db, id, seek, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while updating seek by ID")
		Error(w, code)
		return
	}

	Serve(w, seek)
}

func DeleteSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	err, code := models.DeleteSeek(db, id, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while deleting seek by ID")
		Error(w, code)
		return
	}
}
