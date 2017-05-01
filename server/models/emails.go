package models

import (
	"database/sql"
	"errors"
	"fmt"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"net/http"
	"os"
	"strconv"
)

const (
	DEFAULT_SUBJECT = "I am interested in buying an item from you: %s"
	SEEK_SUBJECT = "I am interested in selling an item to you: %s"
)

type emailInput struct {
	Sender    string
	Recepient string
	Subject   string
	Body      string `json:"body"`
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

	if isSeek {
		i.Subject = fmt.Sprintf(SEEK_SUBJECT, title)
	} else {
		i.Subject = fmt.Sprintf(DEFAULT_SUBJECT, title)
	}

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
	from := getEmail(input.Sender)
	to := getEmail(input.Recepient)
	content := mail.NewContent("text/plain", input.Body)

	// Create email
	m := mail.NewV3Mail()
	m.SetFrom(from)
	p := mail.NewPersonalization()
	p.AddTos(to)
	p.AddCCs(from) // So that the sender still gets a copy in their inbox.
	p.Subject = input.Subject
	m.AddPersonalizations(p)
	m.AddContent(content)

	// Send email, hope for the best
	request := sendgrid.GetRequest(os.Getenv("SENDGRID_API_KEY"), "/v3/mail/send", "https://api.sendgrid.com")
	request.Method = "POST"
	request.Body = mail.GetRequestBody(m)
	response, err := sendgrid.API(request)
	if err != nil {
		return err, http.StatusInternalServerError
	}

	if response.StatusCode != 202 {
		err = errors.New("Response not queued for sending. Status code: " + strconv.Itoa(response.StatusCode))
	}

	return err, response.StatusCode
}
