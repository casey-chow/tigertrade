package models

import (
	"database/sql"
	sq "github.com/Masterminds/squirrel"
	"github.com/guregu/null"
	"net/http"
)

type Photo struct {
	KeyID        int        `json:"keyId"`
	CreationDate null.Time  `json:"creationDate"`
	ListingID    int        `json:"listingId"`
	Url          string     `json:"url"`
	Order        null.Float `json:"order"`
}

// Returns all photos associated with a given listing's key id. On error
// returns an error and the HTTP code associated with that error
func ReadListingPhotos(db *sql.DB, id string) ([]*Photo, error, int) {
	// Build query for photos
	query := psql.
		Select("key_id", "creation_date", "listing_id", "url", "\"order\" ").
		From("photos").
		Where(sq.Eq{"listing_id": id}).
		Where("is_active=true")

	// Query db for photos
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return nil, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate photo struct
	photos := make([]*Photo, 0)
	for rows.Next() {
		p := new(Photo)
		err := rows.Scan(&p.KeyID, &p.CreationDate, &p.ListingID, &p.Url,
			&p.Order)
		if err != nil {
			return nil, err, http.StatusInternalServerError
		}
		photos = append(photos, p)
	}
	if err = rows.Err(); err != nil {
		return nil, err, http.StatusInternalServerError
	}

	return photos, nil, http.StatusOK
}
