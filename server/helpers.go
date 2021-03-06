package server

import (
	"encoding/json"
	"fmt"
	log "github.com/Sirupsen/logrus"
	"github.com/getsentry/raven-go"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
)

// SameOrigin returns true iff two URLs have the same origin
// https://github.com/cbonello/revel-csrf/blob/master/csrf.go#L100
func SameOrigin(u1, u2 *url.URL) bool {
	return (u1.Scheme == u2.Scheme && u1.Host == u2.Host)
}

// OriginValid returns true iff the request has valid origin or referrer headers
// https://goo.gl/nGnXwq
func OriginValid(r *http.Request) bool {
	clientURL, _ := url.Parse(os.Getenv("CLIENT_ROOT"))

	originURLEmpty := (r.Header.Get("Origin") == "")
	originURL, err := url.Parse(r.Header.Get("Origin"))
	if err == nil && !originURLEmpty && SameOrigin(originURL, clientURL) {
		return true
	}

	referrerURLEmpty := (r.Header.Get("Referrer") == "")
	referrerURL, err := url.Parse(r.Header.Get("Referrer"))
	if err == nil && !referrerURLEmpty && SameOrigin(referrerURL, clientURL) {
		return true
	}

	// allow empty for both so we can do API testing
	if originURLEmpty && referrerURLEmpty {
		return true
	}

	return false
}

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
