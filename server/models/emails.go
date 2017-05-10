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

// MailTemplate indicates what SendGrid template to use on the email
type MailTemplate string

const (
	// ContactListingPoster is the email to the owner of a listing when a reader is interesting in buying
	ContactListingPoster MailTemplate = "b53ead7f-c9d7-4c17-9dcf-f59105b6eb65"
	// ContactListingReader is the email to confirm to a reader that they have contacted a listing's owner
	ContactListingReader = "7bb4322d-f98d-417b-b148-90826fe212ab"
	// ContactSeekPoster is the email to the owner of a seek when a reader is interesting in selling
	ContactSeekPoster = "3bb3590f-04a3-4381-a79b-25a86afb4a6f"
	// ContactSeekReader is the email to confirm to a reader that they have contacted a seek's owner
	ContactSeekReader = "d3adbb24-4445-43f8-a026-ec4b013b5850"
	// ContactSearchWatcher is the email to notify a user when their saved search has a new matching listing
	ContactSearchWatcher = "c6388de5-deb7-416b-9527-c5017513ed91"
)

// An EmailInput contains the necessary parameters for the creation of an email
type EmailInput struct {
	Sender    string
	Recipient string
	Subject   string
	Body      string `json:"body"`
	Template  MailTemplate
}

// NewEmailInput creates a new EmailInput with the appropriate default values
func NewEmailInput(db *sql.DB, id string, read PostReader) (*EmailInput, int, error) {
	i := new(EmailInput)

	post, code, err := read(db, id)
	if err != nil {
		return nil, code, err
	}

	i.Subject = post.GetTitle()

	owner, err := GetUserByID(db, post.GetUserID())
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
		return http.StatusBadRequest, errors.New("email To and From fields cannot be the same")
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

	m.SetTemplateID(string(input.Template))

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

func SendEmail2(input *EmailInput) (int, error) {
	robot := mail.NewEmail("TigerTrade", "noreply@tigertra.de")
	recipient := getEmail(input.Sender)
	content := mail.NewContent("text/html", input.Body)

	// Create email
	m := mail.NewV3Mail()
	m.SetFrom(robot)

	p := mail.NewPersonalization()
	p.AddTos(recipient)

	m.SetTemplateID(string(input.Template))

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
