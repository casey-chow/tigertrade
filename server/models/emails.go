package models

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/sendgrid/rest"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"net/http"
	"os"
)

// MailTemplate indicates what sendgrid template to ues on the email
type MailTemplate string

const (
	// ContactListingOwner is the email to the owner of a listing when a reader is interesting in buying
	ContactListingOwner MailTemplate = "b53ead7f-c9d7-4c17-9dcf-f59105b6eb65"
	// ContactListingReader is the email to confirm to a reader that they have contacted a listing's owner
	ContactListingReader = "7bb4322d-f98d-417b-b148-90826fe212ab"
	// ContactSeekOwner is the email to the owner of a seek when a reader is interesting in selling
	ContactSeekOwner = "3bb3590f-04a3-4381-a79b-25a86afb4a6f"
	// ContactSeekReader is the email to confirm to a reader that they have contacted a seek's owner
	ContactSeekReader = "d3adbb24-4445-43f8-a026-ec4b013b5850"
	// ContactSavedSearchOwner is the email to notify a user when their saved search has a new matching listing
	ContactSavedSearchOwner = "c6388de5-deb7-416b-9527-c5017513ed91"
)

// An EmailInput contains the necessary parameters for the creation of an email
type EmailInput struct {
	Sender        string
	Recipient     string
	Subject       string
	Body          string `json:"body"`
	IsSeek        bool
	IsSavedSearch bool // should really be an enum at this point but oh well.
}

func NewEmailInput(db *sql.DB, id string, isSeek bool) (*EmailInput, int, error) {
	i := new(EmailInput)

	var title string
	var ownerID int
	if isSeek {
		seek, code, err := ReadSeek(db, id)
		if err != nil {
			return nil, code, err
		}
		title = seek.Title
		ownerID = seek.UserID
	} else {
		listing, code, err := ReadListing(db, id)
		if err != nil {
			return nil, code, err
		}
		title = listing.Title
		ownerID = listing.UserID
	}

	i.IsSeek = isSeek
	i.Subject = title

	owner, err := GetUserByID(db, ownerID)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	i.Recipient = owner.NetID

	return i, http.StatusOK, nil
}

func getEmail(netID string) *mail.Email {
	addr := netID + "@princeton.edu" // TODO WARNING We can't assume this.
	return mail.NewEmail(netID, addr)
}

func SendEmail(input *EmailInput) (int, error) {
	if input.Sender == input.Recipient {
		return http.StatusBadRequest, errors.New("to and From fields cannot be the same")
	}

	// Get email addresses
	robot := mail.NewEmail("TigerTrade", "noreply@tigertra.de")
	recipient := getEmail(input.Recipient)
	content := mail.NewContent("text/html", input.Body)

	// Create email
	m := mail.NewV3Mail()
	m.SetFrom(robot)
	if input.Sender != "" {
		m.SetReplyTo(getEmail(input.Sender))
	}

	p := mail.NewPersonalization()
	p.AddTos(recipient)

	// Set Template
	if input.IsSeek {
		m.SetTemplateID(string(ContactSeekOwner))
	} else {
		m.SetTemplateID(string(ContactListingOwner))
	}
	if input.IsSavedSearch {
		m.SetTemplateID(string(ContactSavedSearchOwner))
	}

	p.Subject = input.Subject
	m.AddPersonalizations(p)
	m.AddContent(content)

	response, err := sendRequest(m)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	if response.StatusCode != 202 {
		err = errors.New(fmt.Sprint("Response not queued for sending. Status code: ", response.StatusCode))
	}

	return response.StatusCode, err
}

func SendEmail2(input *EmailInput) (int, error) {
	robot := mail.NewEmail("TigerTrade", "noreply@tigertra.de")
	recipient := getEmail(input.Sender)
	content := mail.NewContent("text/html", input.Body)

	// Create email
	m := mail.NewV3Mail()
	m.SetFrom(robot)

	p := mail.NewPersonalization()
	p.AddTos(recipient)

	// Set Template
	if input.IsSeek {
		m.SetTemplateID(string(ContactSeekReader))
	} else {
		m.SetTemplateID(string(ContactListingReader))
	}

	p.Subject = input.Subject
	m.AddPersonalizations(p)
	m.AddContent(content)

	response, err := sendRequest(m)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if response.StatusCode != 202 {
		err = errors.New(fmt.Sprint("response not queued for sending. Status code: ", response.StatusCode))
	}

	return response.StatusCode, err
}

func sendRequest(m *mail.SGMailV3) (*rest.Response, error) {
	// Send email, hope for the best
	request := sendgrid.GetRequest(os.Getenv("SENDGRID_API_KEY"), "/v3/mail/send", "https://api.sendgrid.com")
	request.Method = "POST"
	request.Body = mail.GetRequestBody(m)
	return sendgrid.API(request)
}
