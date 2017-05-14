package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
	"time"
)

// ReadListings performs a customizable request defined by r for a collection of listings, and writes them to w
func ReadListings(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	query := models.NewListingQuery()

	// Get limit from params
	if limit, err := strconv.ParseUint(r.URL.Query().Get("limit"), 10, 64); err == nil && limit != 0 {
		query.Limit = limit
	}

	query.OnlyStarred, _ = strconv.ParseBool(r.URL.Query().Get("isStarred"))
	query.OnlyMine, _ = strconv.ParseBool(r.URL.Query().Get("isMine"))
	query.OnlyPhotos, _ = strconv.ParseBool(r.URL.Query().Get("hasPhotos"))

	if onlyActive, err := strconv.ParseBool(r.URL.Query().Get("onlyActive")); err == nil {
		query.OnlyActive = onlyActive
	}

	if offset, err := strconv.ParseUint(r.URL.Query().Get("offset"), 10, 64); err == nil {
		query.Offset = offset
	}

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

	// Get optional sort order (note the redundancy prevents SQL injections)
	switch r.URL.Query().Get("order") {
	case "creationDateDesc":
		query.Order = models.ListingsCreationDateDesc
		break
	case "creationDateAsc":
		query.Order = models.ListingsCreationDateAsc
		break
	case "expirationDateDesc":
		query.Order = models.ListingsExpirationDateDesc
		break
	case "expirationDateAsc":
		query.Order = models.ListingsExpirationDateAsc
		break
	case "priceDesc":
		query.Order = models.ListingsPriceDesc
		break
	case "priceAsc":
		query.Order = models.ListingsPriceAsc
		break
	}

	// Get optional expiration date filter limits
	iso := "Mon Jan 2 15:04:05 -0700 MST 2006"
	if minExpDate, err := time.Parse(iso, r.URL.Query().Get("minExpDate")); err == nil {
		query.MinExpDate = minExpDate
	}
	if maxExpDate, err := time.Parse(iso, r.URL.Query().Get("maxExpDate")); err == nil {
		query.MaxExpDate = maxExpDate
	}

	// Get optional creation date filter limits
	if minCreateDate, err := time.Parse(iso, r.URL.Query().Get("minCreateDate")); err == nil {
		query.MinCreateDate = minCreateDate
	}
	if maxCreateDate, err := time.Parse(iso, r.URL.Query().Get("maxCreateDate")); err == nil {
		query.MaxCreateDate = maxCreateDate
	}

	listings, code, err := models.ReadListings(db, query)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while reading recent or queried listings")
		Error(w, code)
		return
	}

	Serve(w, listings)
}

// ReadListing writes a listing identified in r to w
func ReadListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id := ps.ByName("id")

	var userID int
	if user, err := models.GetUser(db, getUsername(r)); err == nil {
		userID = user.KeyID
	}

	listings, code, err := models.ReadListing(db, id, userID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while getting listing by ID")
		Error(w, code)
		return
	}

	Serve(w, listings)
}

// CreateListing creates a new listing based on the contents of r, owned by the current user,
// and then writes it to w with its keyId set
func CreateListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get listing to add from request body
	listing := models.Listing{}
	err := ParseJSONFromBody(r, &listing)
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
		log.WithError(err).Error("error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	listing, code, err := models.CreateListing(db, listing, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while adding new listing")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusCreated)
	Serve(w, listing)
}

// UpdateListing updates the requested listing if it is owned by the current user
func UpdateListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	// Get ID from params
	id := ps.ByName("id")

	// Get listing to add from request body
	listing := models.Listing{}
	err := ParseJSONFromBody(r, &listing)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while parsing JSON file")
		Error(w, http.StatusUnprocessableEntity)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	if code, err := models.UpdateListing(db, id, listing, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while updating listing by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DeleteListing deletes the requested listing if it is owned by the current user
func DeleteListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id := ps.ByName("id")

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	if code, err := models.DeleteListing(db, id, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while deleting listing by ID")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UpdateListingStar adds or removes a star to a listing for the current user
func UpdateListingStar(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id := ps.ByName("id")

	// Get isStarred status to change
	input := models.IsStarred{}
	err := ParseJSONFromBody(r, &input)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while parsing JSON")
		Error(w, http.StatusUnprocessableEntity)
		return
	}

	// Retrieve UserID
	user, err := models.GetUser(db, getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while authenticating user: not authorized")
		Error(w, http.StatusUnauthorized)
		return
	}

	// Update Listing data
	if code, err := models.SetStar(db, input.IsStarred, id, user.KeyID); err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while removing star from listing")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
