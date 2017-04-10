package server

import (
	"github.com/getsentry/raven-go"
	"github.com/guregu/null"
	"github.com/julienschmidt/httprouter"
	"log"
	"net/http"
	"strconv"
)

const maxDescriptionSize = 1024
const defaultNumListings = 30
const maxNumListings     = 100

// This is the "JSON" struct that appears in the array returned by getRecentListings
type ListingsItem struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	LastModificationDate null.Time   `json:"lastModificationDate"`
	Title                string      `json:"title"`
	Description          null.String `json:"description"` // expect to be truncated
	UserID               int         `json:"userId"`
	Price                null.Int    `json:"price"`
	Status               null.String `json:"status"`
	ExpirationDate       null.Time   `json:"expirationDate"`
	Thumbnail            null.String `json:"thumbnail"`
}

// Writes the most recent count listings, based on original date created to w
func ServeRecentListings(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	// Get limit from params
	limitStr := r.URL.Query().Get("limit")
	var limit int = defaultNumListings
	var e error
	if limitStr != "" {
		limit, e = strconv.Atoi(limitStr)
		if e != nil || limit == 0 {
			limit = defaultNumListings
		}
	}
	if limit > maxNumListings {
		limit = maxNumListings
	}

	listings, err, code := GetRecentListings(maxDescriptionSize, limit)
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listings)
}

// Returns the most recent count listings, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func GetRecentListings(maxDescriptionSize int, limit int) ([]*ListingsItem, error, int) {

	// Query db
	rows, err := db.Query("SELECT listings.key_id, listings.creation_date, " +
		"listings.last_modification_date, title, left(description, $1), " +
		"user_id, price, status, expiration_date, " +
		"thumbnails.url " +
		"FROM listings LEFT OUTER JOIN thumbnails " +
		"ON listings.thumbnail_id = thumbnails.key_id " +
		"ORDER BY listings.creation_date DESC " +
		"LIMIT $2;", maxDescriptionSize, limit)
	if err != nil {
		return nil, err, 500
	}
	defer rows.Close()

	// Populate listing structs
	listings := make([]*ListingsItem, 0)
	for rows.Next() {
		l := new(ListingsItem)
		err := rows.Scan(&l.KeyID, &l.CreationDate, &l.LastModificationDate,
			&l.Title, &l.Description, &l.UserID, &l.Price, &l.Status,
			&l.ExpirationDate, &l.Thumbnail)
		if err != nil {
			return nil, err, 500
		}
		listings = append(listings, l)
	}
	if err = rows.Err(); err != nil {
		return nil, err, 500
	}

	return listings, nil, 0
}
