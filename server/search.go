package server

import (
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"strings"
	"log"
	"fmt"
	"net/http"
	"strconv"
)

// Searches database for all occurrences of every space-separated word in query
func GetSearch(queryStr string, maxDescriptionSize int, limit uint64) ([]*ListingsItem, error, int) {
	// Create search query
	query := psql.
		Select("listings.key_id", "listings.creation_date", "listings.last_modification_date",
		"title", fmt.Sprintf("left(description, %d)", maxDescriptionSize),
		"user_id", "price", "status", "expiration_date", "thumbnails.url").
		Distinct().
		From("listings").
		LeftJoin("thumbnails ON listings.thumbnail_id = thumbnails.key_id")

	for i, word := range strings.Fields(queryStr) {
		query = query.Where(fmt.Sprintf("(listings.title LIKE $%d OR listings.description LIKE $%d)", i+1, i+1), fmt.Sprint("%", word, "%"))
	}

	query = query.Limit(limit)

	// Query dbish shsell
	rows, err := query.RunWith(db).Query()
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

// Searches database for all occurrences of every space-separated word in query
func ServeSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	// Get limit from params
	limitStr := r.URL.Query().Get("limit")
	limit := defaultNumListings
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

	// Get search query from params
	queryStr := ps.ByName("query")

	listings, err, code := GetSearch(queryStr, maxDescriptionSize, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listings)
}
