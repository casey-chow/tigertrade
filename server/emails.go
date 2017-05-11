package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

// ContactListing reads the listing from the params and sends notification and confirmation emails
// to the listing owner and current user
func ContactListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	contactPost(w, r, ps, models.ReadListingAsPost, models.ContactListingPoster, models.ContactListingReader)
}

// ContactSeek reads the seek from the params and sends notification and confirmation emails
// to the seek owner and current user
func ContactSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	contactPost(w, r, ps, models.ReadSeekAsPost, models.ContactSeekPoster, models.ContactSeekReader)
}

func contactPost(w http.ResponseWriter, r *http.Request, ps httprouter.Params,
	read models.PostReader, posterTemplate models.MailTemplate, readerTemplate models.MailTemplate) {

	// Get post ID from params
	id := ps.ByName("id")
	if id == "" {
		Error(w, http.StatusBadRequest)
		return
	}

	email, code, err := models.NewEmailInput(db, id, read)
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while creating email struct")
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
		log.WithError(err).Error("error while parsing JSON file")
		Error(w, http.StatusUnprocessableEntity)
		return
	}

	// Send email
	email.Template = posterTemplate
	if code, err := models.SendNotificationEmail(email); err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while attempting to send email to poster")
		Error(w, code)
		return
	}
	email.Template = readerTemplate
	if code, err := models.SendConfirmationEmail(email); err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).Error("error while attempting to send email to post reader")
		Error(w, code)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
