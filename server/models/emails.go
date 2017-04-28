package models

import (
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"os"
	"strconv"
	"errors"
)

// This isn't actually used here at all, nor should it. I'm putting it here
// for consistency with other models.
// This is the json struct we expect to get from the user when the request to
// send an email is sent. We should _not_ accept anything other than the body.
// (Ok _maybe_ the subject if we decide to, but never the netIds)
type EmailInput struct {
	Body         string `json:"body"`
}

func getEmail(netId string) *mail.Email {
	addr := netId + "@princeton.edu" // TODO WARNING We can't assume this. 
	return mail.NewEmail(netId, addr)
}

func SendEmail(netIdFrom string, netIdTo string, subject string, body string) error {

	if(netIdFrom == netIdTo) {
		return errors.New("To and From fields cannot be the same.")
	}

	// Get email addresses
	from := getEmail(netIdFrom)
	to := getEmail(netIdTo)
	content := mail.NewContent("text/plain", body)

	// Create email
	m := mail.NewV3Mail()
	m.SetFrom(from)
	p := mail.NewPersonalization()
	p.AddTos(to)
	p.AddCCs(from) // So that the sender still gets a copy in their inbox.
	p.Subject = subject
	m.AddPersonalizations(p)
	m.AddContent(content)

	// Send email, hope for the best
	request := sendgrid.GetRequest(os.Getenv("SENDGRID_API_KEY"), "/v3/mail/send", "https://api.sendgrid.com")
	request.Method = "POST"
	request.Body = mail.GetRequestBody(m)
	response, err := sendgrid.API(request)

	if err == nil && response.StatusCode != 202 {
		err = errors.New("Response not qued for sending. Status code: " + strconv.Itoa(response.StatusCode))
	}

	return err
}
