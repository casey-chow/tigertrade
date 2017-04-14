package server

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/getsentry/raven-go"
	"github.com/guregu/null"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

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

// Returned by a getById function
type Listing struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	LastModificationDate null.Time   `json:"lastModificationDate"`
	Title                string      `json:"title"`
	Description          null.String `json:"description"`
	UserID               int         `json:"userId"`
	Price                null.Int    `json:"price"`
	Status               null.String `json:"status"`
	ExpirationDate       null.Time   `json:"expirationDate"`
	Thumbnail            null.String `json:"thumbnail"`
	Photos               []Photo     `json:"photos"`
}

// Writes the most recent count listings, based on original date created to w
func ServeRecentListings(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	// Get limit from params
	limitStr := r.URL.Query().Get("limit")
	limit := defaultNumResults
	var e error
	if limitStr != "" {
		limit, e = strconv.Atoi(limitStr)
		if e != nil || limit == 0 {
			limit = defaultNumResults
		}
	}
	if limit > maxNumResults {
		limit = maxNumResults
	}

	listings, err, code := GetRecentListings(truncationLength, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listings)
}

// Returns the most recent count listings, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func GetRecentListings(maxDescriptionSize int, limit uint64) ([]*ListingsItem, error, int) {
	// Create listings query
	query := psql.
		Select("listings.key_id", "listings.creation_date", "listings.last_modification_date",
			"title", fmt.Sprintf("left(description, %d)", maxDescriptionSize),
			"user_id", "price", "status", "expiration_date", "thumbnails.url").
		From("listings").
		Where("listings.is_active=true").
		LeftJoin("thumbnails ON listings.thumbnail_id = thumbnails.key_id").
		OrderBy("listings.creation_date DESC").
		Limit(limit)

	// Query db
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

// Writes the most recent count listings, based on original date created to w
func ServeListingById(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	listings, err, code := GetListingById(id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listings)
}

// Returns the most recent count listings, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func GetListingById(id string) (Listing, error, int) {
	var listing Listing

	// Create listing query
	query := psql.
		Select("listings.key_id", "listings.creation_date", "listings.last_modification_date",
			"title", "description", "user_id", "price", "status", "expiration_date",
			"thumbnails.url").
		From("listings").
		Where("listings.is_active=true").
		LeftJoin("thumbnails ON listings.thumbnail_id = thumbnails.key_id").
		Where(sq.Eq{"listings.key_id": id})

	// Query db for listing
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return listing, err, 500
	}
	defer rows.Close()

	// Populate listing struct
	rows.Next()
	err = rows.Scan(&listing.KeyID, &listing.CreationDate,
		&listing.LastModificationDate, &listing.Title, &listing.Description,
		&listing.UserID, &listing.Price, &listing.Status,
		&listing.ExpirationDate, &listing.Thumbnail)
	if err == sql.ErrNoRows {
		return listing, err, 404
	} else if err != nil {
		return listing, err, 500
	}

	// Add photos to struct
	photos, err, code := GetPhotosByListingId(id)
	if err != nil {
		return listing, err, code
	}
	for i := range photos {
		listing.Photos = append(listing.Photos, *photos[i])
	}

	return listing, nil, 0
}

func ServeAddListing(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	// Get listing to add from request body
	listing := Listing{}
	// TODO this fails silently for some reason if r.Body contains invalid JSON
	json.NewDecoder(r.Body).Decode(&listing)

	// Retrieve UserID
	user, err := getUser(getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(401), 401)
		return
	}

	listing, err, code := AddListing(listing, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listing)
}

// Inserts the given listing (belonging to userId) into the database. Returns
// listing with its new KeyID added.
func AddListing(listing Listing, userId int) (Listing, error, int) {
	listing.UserID = userId

	// Insert listing
	stmt := psql.Insert("listings").
		Columns("title", "description", "user_id", "price", "status",
			"expiration_date", "thumbnail_id").
		Values(listing.Title, listing.Description, userId, listing.Price,
			listing.Status, listing.ExpirationDate, listing.Thumbnail).
		Suffix("RETURNING key_id, creation_date")

	// Query db for listing
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return listing, err, 500
	}
	defer rows.Close()

	// Populate listing struct
	rows.Next()
	err = rows.Scan(&listing.KeyID, &listing.CreationDate)
	if err != nil {
		return listing, err, 500
	}

	return listing, nil, 0
}

func ServeUpdateListingById(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if r.Method != "POST" {
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

	// Get listing to add from request body
	listing := Listing{}
	// TODO this fails silently for some reason if r.Body contains invalid JSON
	json.NewDecoder(r.Body).Decode(&listing)

	// Retrieve UserID
	user, err := getUser(getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(401), 401)
		return
	}

	listing, err, code := UpdateListingById(id, listing, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, listing)
}

// Overwrites the listing in the database with the given id with the given listing
// (belonging to userId). Returns the updated listing.
func UpdateListingById(id string, listing Listing, userId int) (Listing, error, int) {
	listing.UserID = userId

	// Update listing
	stmt := psql.Update("listings").
		SetMap(map[string]interface{}{
			"title": listing.Title,
			"description": listing.Description,
			"user_id": userId,
			"price": listing.Price,
			"status": listing.Status,
			"expiration_date": listing.ExpirationDate,
			"thumbnail_id": listing.Thumbnail}).
		Where(sq.Eq{"listings.key_id": id,
			"listings.user_id": userId})

	// Query db for listing
	result, err := stmt.RunWith(db).Exec()
	if err != nil {
		return listing, err, 500
	}

	numRows, err := result.RowsAffected()
	if err != nil {
		return listing, err, 500
	}
	if numRows == 0 {
		return listing, sql.ErrNoRows, 404
	}
	if numRows != 1 {
		return listing, errors.New("Multiple rows affected by UpdateListingById"), 500
	}
	keyId, err := result.LastInsertId()
	if err != nil {
		return listing, err, 500
	}
	if string(keyId) != id {
		return listing, errors.New("Wrong row affected by UpdateListingById"), 500
	}

	return GetListingById(id)
}
