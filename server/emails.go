package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
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

	email, err, code := models.NewEmailInput(db, id, isSeek)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while creating email struct")
		Error(w, code)
		return
	}

	// Get NetId of the user initiating the contact
	if email.Sender = getUsername(r); email.Sender == "" {
		Error(w, http.StatusUnauthorized)
		return
	}

	// Get Body from request
	if err := ParseJSONFromBody(r, &email); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON file")
		Error(w, http.StatusInternalServerError)
		return
	}

	// Send email
	if err, code := models.SendEmail(email); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("Error while attempting to send email")
		Error(w, code)
		return
	}
}
