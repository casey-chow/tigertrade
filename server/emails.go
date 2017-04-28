package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

const (
	// yeah I know it sounds weird, we can change it later.
	DEFAULT_SUBJECT = "I am interested in buying an item from you."
)

// (•_•) ( •_•)>⌐■-■ (⌐■_■)
func ContactListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ContactPost(w, r, ps, false)
}
func ContactSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ContactPost(w, r, ps, true)
}

// Sends an email from the current user to the owner of a given post
func ContactPost(w http.ResponseWriter, r *http.Request, ps httprouter.Params, isSeek bool) {

	// Get post ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusNotFound)
		return
	}

	// Get Body from request
	email := models.EmailInput{}
	err := ParseJSONFromBody(r, &email)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON file")
		Error(w, http.StatusInternalServerError)
		return
	}
	body := email.Body

	// Get NetId of the user initiating the contact
	sender := getUsername(r)
	if sender == "" {
		Error(w, http.StatusUnauthorized)
		return
	}

	// Get NetId of the user that created this post
	postOwner, err, code := getOwner(id, isSeek)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while getting the owner of the post")
		Error(w, code)
		return
	}

	// Send email
	err = models.SendEmail(sender, postOwner, DEFAULT_SUBJECT, body)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while attempting to send email")
		Error(w, http.StatusInternalServerError)
		return
	}
}

// Returns the netId of the owner of a post with the given id
func getOwner(id string, isSeek bool) (string, error, int) {

	var err error
	var code int
	var ownerId int
	var seek models.Seek
	var listing models.Listing

	if isSeek {
		seek, err, code = models.ReadSeek(db, id)
		ownerId = seek.UserID
	} else {
		listing, err, code = models.ReadListing(db, id)
		ownerId = listing.UserID
	}

	if err != nil {
		return "", err, code
	}

	owner, _ := models.GetUserByID(db, ownerId)

	return owner.NetID, err, code
}
