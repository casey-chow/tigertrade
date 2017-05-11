package server

import (
	"encoding/json"
	"fmt"
	log "github.com/Sirupsen/logrus"
	"github.com/getsentry/raven-go"
	"io/ioutil"
	"net/http"
	"strings"
)

// Serve converts v to a JSON string and writes to w.
// Writes an InternalServerError on error
func Serve(w http.ResponseWriter, v interface{}) {
	var marshaled []byte
	if v == nil {
		marshaled = []byte("{}")
	} else {
		var err error
		marshaled, err = json.Marshal(v)
		if err != nil {
			log.WithError(err).Error("error while marshaling to JSON")
			raven.CaptureError(err, nil)
			Error(w, http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json;charset=utf-8")
	fmt.Fprint(w, string(marshaled))
}

// Error writes an HTTP error with default status text. It does not end the stream
func Error(w http.ResponseWriter, code int) {
	http.Error(w, http.StatusText(code), code)
}

// ParseJSONFromBody reads r as a JSON string and writes its attributes to v
func ParseJSONFromBody(r *http.Request, v interface{}) error {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(body, v)
}

// PrettyPrintRequest generates the ASCII representation of a request
// https://medium.com/doing-things-right/pretty-printing-http-requests-in-golang-a918d5aaa000
func PrettyPrintRequest(r *http.Request) string {
	// Create return string
	var request []string
	// Add the request string
	url := fmt.Sprintf("%v %v %v", r.Method, r.URL, r.Proto)
	request = append(request, url)
	// Add the host
	request = append(request, fmt.Sprintf("Host: %v", r.Host))
	// Loop through headers
	for name, headers := range r.Header {
		name = strings.ToLower(name)
		for _, h := range headers {
			request = append(request, fmt.Sprintf("%v: %v", name, h))
		}
	}

	// If this is a POST, add post data
	if r.Method == "POST" {
		r.ParseForm()
		request = append(request, "\n")
		request = append(request, r.Form.Encode())
	}
	// Return the request as a string
	return strings.Join(request, "\n")
}
