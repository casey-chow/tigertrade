package server

import (
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

// Writes all photos associated with a given listing's key id to w
func ServePhotosByListingId(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	// Retrieve photos by listing id
	photos, err, code := GetPhotosByListingId(id)
	if err != nil {
		log.Print(err)
		raven.CaptureError(err, nil)
		http.Error(w, http.StatusText(code), code)
	}

	// Write photos object to output
	Serve(w, photos)
}

// Returns all photos associated with a given listing's key id. On error
// returns an error and the HTTP code associated with that error
func GetPhotosByListingId(id string) ([]*Photo, error, int) {
	// Query db for photo
	rows, err := db.Query(
		"SELECT key_id, creation_date, listing_id, url, \"order\" " +
		"FROM photos " +
		"WHERE listing_id = $1;", id)
	if err != nil {
		return nil, err, 500
	}
	defer rows.Close()

	// Populate photo struct
	photos := make([]*Photo, 0)
	for rows.Next() {
		p := new(Photo)
		err := rows.Scan(&p.KeyID, &p.CreationDate, &p.ListingID, &p.Url,
			&p.Order)
		if err != nil {
			return nil, err, 500
		}
		photos = append(photos, p)
	}
	if err = rows.Err(); err != nil {
		return nil, err, 500
	}

	return photos, nil, 0
}
