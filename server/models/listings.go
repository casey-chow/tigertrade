package models

import (
	"database/sql"
	"errors"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	"github.com/guregu/null"
	"strings"
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

// Returns the most recent count listings, based on original date created.
// If queryStr is nonempty, filters that every returned item must have every word in either title or description
// On error, returns an error and the HTTP code associated with that error.
func ReadListings(db *sql.DB, queryStr string, maxDescriptionSize int, limit uint64) ([]*ListingsItem, error, int) {
	// Create listings query
	query := psql.
		Select("listings.key_id", "listings.creation_date", "listings.last_modification_date",
			"title", fmt.Sprintf("left(description, %d)", maxDescriptionSize),
			"user_id", "price", "status", "expiration_date", "thumbnails.url").
		From("listings").
		Where("listings.is_active=true").
		LeftJoin("thumbnails ON listings.thumbnail_id = thumbnails.key_id")

	for i, word := range strings.Fields(queryStr) {
		query = query.Where(fmt.Sprintf("(lower(listings.title) LIKE lower($%d) OR lower(listings.description) LIKE lower($%d))", i+1, i+1), fmt.Sprint("%", word, "%"))
	}

	query = query.
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

// Returns the most recent count listings, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func ReadListing(db *sql.DB, id string) (Listing, error, int) {
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
	photos, err, code := ReadListingPhotos(db, id)
	if err != nil {
		return listing, err, code
	}
	for i := range photos {
		listing.Photos = append(listing.Photos, *photos[i])
	}

	return listing, nil, 0
}

// Inserts the given listing (belonging to userId) into the database. Returns
// listing with its new KeyID added.
func CreateListing(db *sql.DB, listing Listing, userId int) (Listing, error, int) {
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

// Overwrites the listing in the database with the given id with the given listing
// (belonging to userId). Returns the updated listing.
func UpdateListing(db *sql.DB, id string, listing Listing, userId int) (Listing, error, int) {
	listing.UserID = userId

	// Update listing
	stmt := psql.Update("listings").
		SetMap(map[string]interface{}{
			"title":           listing.Title,
			"description":     listing.Description,
			"user_id":         userId,
			"price":           listing.Price,
			"status":          listing.Status,
			"expiration_date": listing.ExpirationDate,
			"thumbnail_id":    listing.Thumbnail}).
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

	return ReadListing(db, id)
}
