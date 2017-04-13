package server

import (
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/getsentry/raven-go"
	"github.com/guregu/null"
	"github.com/julienschmidt/httprouter"
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
	// Build query for photos
	query := psql.
		Select("key_id", "creation_date", "listing_id", "url", "\"order\" ").
		From("photos").
		Where(sq.Eq{"listing_id": id}).
		Where("is_active=true")


	// Query db for photos
	rows, err := query.RunWith(db).Query()
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
