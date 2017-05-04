package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

// Writes the most recent count listings, based on original date created to w
func ReadListings(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	query := models.NewListingQuery()

	// Get limit from params
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit != 0 {
			query.Limit = uint64(limit)
		}
	}

	// ParseBool defaults to false
	query.OnlyStarred, _ = strconv.ParseBool(r.URL.Query().Get("isStarred"))
	query.OnlyMine, _ = strconv.ParseBool(r.URL.Query().Get("isMine"))

	// Get User ID if we happen to be logged in
	if user, err := models.GetUser(db, getUsername(r)); err == nil {
		query.UserID = user.KeyID
	}

	// Get optional search query from params
	query.Query = r.URL.Query().Get("query")

	// Get optional price filter limits
	if minPrice, err := strconv.Atoi(r.URL.Query().Get("minPrice")); err == nil {
		query.MinPrice = minPrice
	}
	if maxPrice, err := strconv.Atoi(r.URL.Query().Get("maxPrice")); err == nil {
		query.MaxPrice = maxPrice
	}

	listings, err, code := models.ReadListings(db, query)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while reading recent or queried listings")
		Error(w, code)
		return
	}

	Serve(w, listings)
}

// Writes the most recent count listings, based on original date created to w
func ReadListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusNotFound)
		return
	}

	listings, err, code := models.ReadListing(db, id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting listing by ID")
		Error(w, code)
		return
	}

	Serve(w, listings)
}

func CreateListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get listing to add from request body
	listing := models.Listing{}
	err := ParseJSONFromBody(r, &listing)
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

	listing, err, code := models.CreateListing(db, listing, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while adding new listing")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusCreated)
	Serve(w, listing)
}

func UpdateListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusNotFound)
		return
	}

	// Get listing to add from request body
	listing := models.Listing{}
	err := ParseJSONFromBody(r, &listing)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON file")
		Error(w, http.StatusInternalServerError)
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

	if err, code := models.UpdateListing(db, id, listing, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while updating listing by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func DeleteListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	if err, code := models.DeleteListing(db, id, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while deleting listing by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func UpdateListingStar(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		Error(w, http.StatusNotFound)
		return
	}

	// Get isStarred status to change
	input := models.IsStarred{}
	err := ParseJSONFromBody(r, &input)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON")
		Error(w, http.StatusInternalServerError)
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

	// Update Listing data
	if err, code := models.SetStar(db, input.IsStarred, id, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while removing star from listing")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
