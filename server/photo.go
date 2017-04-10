package server

import (
	"encoding/json"
	"fmt"
	"github.com/getsentry/raven-go"
	"github.com/guregu/null"
	"github.com/julienschmidt/httprouter"
	"log"
	"net/http"
)

type Photo struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	ListingID            int         `json:"listingId"`
	Url                  string      `json:"url"`
	Order                null.Float  `json:"order"`
}

// Returns all photos associated with a given listing's key id
func GetPhotosByListingId(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	// Get ID from params
	id := ps.ByName("id")
	if id == "" {
		// Return 404 error with empty body if not found
		http.Error(w, "", 404)
		return
	}

	// Query db for listing
	rows, err := db.Query(
		"SELECT key_id, creation_date, listing_id, url, \"order\" " +
		"FROM photos " +
		"WHERE listing_id = $1;", id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	defer rows.Close()

	// Populate listing struct
	photos := make([]*Photo, 0)
	for rows.Next() {
		p := new(Photo)
		err := rows.Scan(&p.KeyID, &p.CreationDate, &p.ListingID, &p.Url,
			&p.Order)
		if err != nil {
			log.Print(err)
			raven.CaptureError(err, nil)
			http.Error(w, http.StatusText(500), 500)
			return
		}
		photos = append(photos, p)
	}
	if err = rows.Err(); err != nil {
		log.Print(err)
		raven.CaptureError(err, nil)
		http.Error(w, http.StatusText(500), 500)
		return
	}

	// Convert listings to JSON, Return to client
	p, err := json.Marshal(photos)
	if err != nil {
		log.Print(err)
		raven.CaptureError(err, nil)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json;charset=utf-8")
	fmt.Fprint(w, string(p))
}
