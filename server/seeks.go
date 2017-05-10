package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

// ReadSeeks performs a customizable request defined by r for a collection of seeks, and writes them to w
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

	seeks, code, err := models.ReadSeeks(db, query)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while reading recent or queried seeks")
		Error(w, code)
		return
	}

	Serve(w, seeks)
}

// ReadSeek writes the seek identified in r to w
func ReadSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusBadRequest)
		return
	}

	seeks, code, err := models.ReadSeek(db, id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while getting seek by ID")
		Error(w, code)
		return
	}

	Serve(w, seeks)
}

// CreateSeek creates a new seek based on the contents of r, owned by the current user,
// and then writes it to w with its keyId set
func CreateSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get seek to add from request body
	seek := models.Seek{}
	err := ParseJSONFromBody(r, &seek)
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

	seek, code, err := models.CreateSeek(db, seek, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while adding new seek")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusCreated)
	Serve(w, seek)
}

// UpdateSeek updates the requested seek if it is owned by the current user
func UpdateSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusBadRequest)
		return
	}

	// Get seek to add from request body
	seek := models.Seek{}
	err := ParseJSONFromBody(r, &seek)
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

	if code, err := models.UpdateSeek(db, id, seek, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while updating seek by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DeleteSeek deletes the requested seek if it is owned by the current user
func DeleteSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	if code, err := models.DeleteSeek(db, id, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("Error while deleting seek by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
