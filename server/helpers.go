package server

import (
	"encoding/json"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/getsentry/raven-go"
	"net/http"
)

// Postgres Statement Builder instance
var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

// Serve converts v to a JSON string and writes to w. Writes an
// HTTP 500 error on error.
func Serve(w http.ResponseWriter, v interface{}) {
	var marshaled []byte
	if v == nil {
		marshaled = []byte("{}")
	} else {
		var err error
		marshaled, err = json.Marshal(v)
		if err != nil {
			log.Print(err)
			raven.CaptureError(err, nil)
			http.Error(w, http.StatusText(500), 500)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json;charset=utf-8")
	fmt.Fprint(w, string(marshaled))
}

// Serve404 returns a 404 code to w. It does not end the stream.
func Serve404(w http.ResponseWriter) {
	http.Error(w, http.StatusText(404), 404)
}
