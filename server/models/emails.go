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
		m.SetTemplateID("3bb3590f-04a3-4381-a79b-25a86afb4a6f")
	} else {
		m.SetTemplateID("b53ead7f-c9d7-4c17-9dcf-f59105b6eb65")
	}
	if input.IsSavedSearch {
		m.SetTemplateID("c6388de5-deb7-416b-9527-c5017513ed91")
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
		m.SetTemplateID("7bb4322d-f98d-417b-b148-90826fe212ab")
	} else {
		m.SetTemplateID("d3adbb24-4445-43f8-a026-ec4b013b5850")
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

func sendRequest(m *mail.SGMailV3) (*rest.Response, error) {
	// Send email, hope for the best
	request := sendgrid.GetRequest(os.Getenv("SENDGRID_API_KEY"), "/v3/mail/send", "https://api.sendgrid.com")
	request.Method = "POST"
	request.Body = mail.GetRequestBody(m)
	return sendgrid.API(request)
}
