package models

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"net/http"
	"os"
)

type emailInput struct {
	Sender    string
	Recepient string
	Subject   string
	Body      string `json:"body"`
	IsSeek    bool
}

func NewEmailInput(db *sql.DB, id string, isSeek bool) (*emailInput, error, int) {
	i := new(emailInput)

	var title string
	var ownerId int
	if isSeek {
		seek, err, code := ReadSeek(db, id)
		if err != nil {
			return nil, err, code
		}
		title = seek.Title
		ownerId = seek.UserID
	} else {
		listing, err, code := ReadListing(db, id)
		if err != nil {
			return nil, err, code
		}
		title = listing.Title
		ownerId = listing.UserID
	}

	i.IsSeek = isSeek
	i.Subject = title

	if owner, err := GetUserByID(db, ownerId); err != nil {
		return nil, err, http.StatusInternalServerError
	} else {
		i.Recepient = owner.NetID
	}

	return i, nil, http.StatusOK
}

func getEmail(netId string) *mail.Email {
	addr := netId + "@princeton.edu" // TODO WARNING We can't assume this.
	return mail.NewEmail(netId, addr)
}

func SendEmail(input *emailInput) (error, int) {

	if input.Sender == input.Recepient {
		return errors.New("To and From fields cannot be the same."), http.StatusBadRequest
	}

	// Get email addresses
	robot := mail.NewEmail("TigerTrade", "noreply@tigertra.de")
	requestor := getEmail(input.Sender)
	recipient := getEmail(input.Recepient)
	content := mail.NewContent("text/html", input.Body)

	// Create email
	m := mail.NewV3Mail()
	m.SetFrom(robot)
	p := mail.NewPersonalization()
	p.AddTos(recipient)
	p.AddCCs(requestor) // So that the sender still gets a copy in their inbox.
	p.Subject = input.Subject
	m.AddPersonalizations(p)
	m.AddContent(content)

	// Set Template
	if input.IsSeek {
		m.SetTemplateID("3bb3590f-04a3-4381-a79b-25a86afb4a6f")
	} else {
		m.SetTemplateID("b53ead7f-c9d7-4c17-9dcf-f59105b6eb65")
	}

	// Send email, hope for the best
	request := sendgrid.GetRequest(os.Getenv("SENDGRID_API_KEY"), "/v3/mail/send", "https://api.sendgrid.com")
	request.Method = "POST"
	request.Body = mail.GetRequestBody(m)
	response, err := sendgrid.API(request)
	if err != nil {
		return err, http.StatusInternalServerError
	}

	if response.StatusCode != 202 {
		err = errors.New(fmt.Sprint("Response not queued for sending. Status code: ", response.StatusCode))
	}

	return err, response.StatusCode
}
