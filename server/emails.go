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
	contactPost(w, r, ps, false)
}
func ContactSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	contactPost(w, r, ps, true)
}

// Sends an email from the current user to the owner of a given post
func contactPost(w http.ResponseWriter, r *http.Request, ps httprouter.Params, isSeek bool) {
	// Get post ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusBadRequest)
		return
	}

	email, code, err := models.NewEmailInput(db, id, isSeek)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while creating email struct")
		Error(w, code)
		return
	}

	// Get NetID of the user initiating the contact
	if email.Sender = getUsername(r); email.Sender == "" {
		Error(w, http.StatusUnauthorized)
		return
	}

	// Get Body from request
	if err := ParseJSONFromBody(r, &email); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while parsing JSON file")
		Error(w, http.StatusUnprocessableEntity)
		return
	}

	// Send email
	if (isSeek) {
		email.Template = models.ContactSeekPoster
	} else {
		email.Template = models.ContactListingPoster
	}
	if code, err := models.SendEmail(email); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while attempting to send email to poster")
		Error(w, code)
		return
	}

	if (isSeek) {
		email.Template = models.ContactSeekReader
	} else {
		email.Template = models.ContactListingReader
	}
	if code, err := models.SendEmail2(email); err != nil {
		raven.CaptureError(err, nil)
		log.WithField("err", err).Error("error while attempting to send email to post reader")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
