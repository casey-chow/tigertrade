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
	query := models.NewSeekQuery()

	// Get limit from params
	if limit, err := strconv.ParseUint(r.URL.Query().Get("limit"), 10, 64); err == nil && limit != 0 {
		query.Limit = limit
	}

	query.OnlyMine, _ = strconv.ParseBool(r.URL.Query().Get("isMine"))

	if offset, err := strconv.ParseUint(r.URL.Query().Get("offset"), 10, 64); err == nil {
		query.Offset = offset
	}

	// Get User ID if we happen to be logged in
	if user, err := models.GetUser(db, getUsername(r)); err == nil {
		query.UserID = user.KeyID
	}

	// Get optional search query from params
	query.Query = r.URL.Query().Get("query")

	seeks, err, code := models.ReadSeeks(db, query)
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
		Error(w, http.StatusNotFound)
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

	seek, err, code := models.CreateSeek(db, seek, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while adding new seek")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusCreated)
	Serve(w, seek)
}

func UpdateSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusNotFound)
		return
	}

	// Get seek to add from request body
	seek := models.Seek{}
	err := ParseJSONFromBody(r, &seek)
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

	if err, code := models.UpdateSeek(db, id, seek, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while updating seek by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func DeleteSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	if err, code := models.DeleteSeek(db, id, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while deleting seek by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
