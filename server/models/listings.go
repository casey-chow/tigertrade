package models

import (
	"database/sql"
	"errors"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/guregu/null"
	"github.com/lib/pq"
	"net/http"
	"strings"
	"time"
)

// Returned by a function returning only one listing (usually by ID)
type Listing struct {
	KeyID                int            `json:"keyId"`
	CreationDate         null.Time      `json:"creationDate"`
	LastModificationDate null.Time      `json:"lastModificationDate"`
	Title                string         `json:"title"`
	Description          null.String    `json:"description"`
	UserID               int            `json:"userId"`
	Username             null.String    `json:"username"`
	Price                null.Int       `json:"price"`
	Status               null.String    `json:"status"`
	ExpirationDate       null.Time      `json:"expirationDate"`
	Thumbnail            null.String    `json:"thumbnail"`
	Photos               pq.StringArray `json:"photos"`
	IsStarred            bool           `json:"isStarred"`
}

type listingQuery struct {
	Query            string
	OnlyStarred      bool
	OnlyMine         bool
	TruncationLength int    // number of characters to truncate listing descriptions to
	Limit            uint64 // maximum number of listings to return
	Offset           uint64 // offset in search results to send
	UserID           int
	MinPrice         int
	MaxPrice         int
	MinExpDate       time.Time
	MaxExpDate       time.Time
	MinCreateDate    time.Time
	MaxCreateDate    time.Time
}

func NewListingQuery() *listingQuery {
	q := new(listingQuery)
	q.TruncationLength = defaultTruncationLength
	q.Limit = defaultNumResults
	q.MinPrice = -1
	q.MaxPrice = -1
	return q
}

type IsStarred struct {
	IsStarred bool `json:"isStarred"`
}

// Returns the SQL query that returns true if a particular listing is starred
// by the user with key_id id. This method exists because dealing with nested
// SQL queries in squirrel is an ugly pain in the ass.
func isStarredBy(id int) string {
	// "But Perry!" you say,
	// "concatenating strings and putting it directly in an SQL query is bad!"
	// you say.
	// "You're exactly correct, of course. Unfortunately we need a nested sql
	// query here and I couldn't find any documentation for nested queries
	// using squirrel. (Or any other documentation on squirrel other than the
	// godocs). On the bright side, we're not actually opening ourselves to an
	// injection attack since id is guaranteed to be an int."
	// "But isn't this still annoying and ugly?"
	// "Yeah."
	return fmt.Sprint("exists( SELECT 1 FROM starred_listings",
		" WHERE starred_listings.listing_id=listings.key_id",
		" AND starred_listings.user_id=", id,
		" AND starred_listings.is_active)")
}

// Returns the most recent count listings, based on original date created.
// If queryStr is nonempty, filters that every returned item must have every word in either title or description
// On error, returns an error and the HTTP code associated with that error.
func ReadListings(db *sql.DB, query *listingQuery) ([]*Listing, error, int) {
	// Create listings statement
	stmt := psql.
		Select(
			"listings.key_id",
			"listings.creation_date",
			"listings.last_modification_date",
			"title",
			fmt.Sprintf("left(description, %d)", query.TruncationLength),
			"user_id",
			"users.net_id",
			"price",
			"status",
			"expiration_date",
			"thumbnail_url",
			isStarredBy(query.UserID),
			"photos",
		).
		From("listings").
		Where("listings.is_active=true").
		LeftJoin("users ON listings.user_id = users.key_id")

	// WARNING changes here will also requrire changes in savesearches.CheckNewLisitng.
	// If this is ever changed, we should really just refactor it into a
	// separate function that can be easily shared
	for _, word := range strings.Fields(query.Query) {
		stmt = stmt.Where("(lower(listings.title) LIKE lower(?) OR lower(listings.description) LIKE lower(?))", fmt.Sprint("%", word, "%"), fmt.Sprint("%", word, "%"))
	}

	if query.UserID == 0 && (query.OnlyStarred || query.OnlyMine) {
		return nil, errors.New("Unauthenticated user attempted to view profile data"), http.StatusUnauthorized
	}

	if query.MinPrice >= 0 {
		stmt = stmt.Where("listings.price >= ?", query.MinPrice)
	}

	if query.MaxPrice >= 0 {
		stmt = stmt.Where("listings.price <= ?", query.MaxPrice)
	}

	if !query.MinExpDate.IsZero() {
		stmt = stmt.Where("listings.expiration_date >= ? OR listings.expiration_date IS NULL", query.MinExpDate)
	}

	if !query.MaxExpDate.IsZero() {
		stmt = stmt.Where("listings.expiration_date <= ?", query.MaxExpDate)
	}

	if !query.MinCreateDate.IsZero() {
		stmt = stmt.Where("listings.creation_date >= ? OR listings.creation_date IS NULL", query.MinCreateDate)
	}

	if !query.MaxCreateDate.IsZero() {
		stmt = stmt.Where("listings.creation_date <= ?", query.MaxCreateDate)
	}

	if query.OnlyStarred {
		stmt = stmt.Where(isStarredBy(query.UserID))
	}

	if query.OnlyMine {
		stmt = stmt.Where(sq.Eq{"user_id": query.UserID})
	}

	stmt = stmt.OrderBy("listings.creation_date DESC")
	if query.Limit > defaultNumResults {
		stmt = stmt.Limit(query.Limit)
	} else {
		stmt = stmt.Limit(defaultNumResults)
	}
	stmt = stmt.Offset(query.Offset)

	queryStr, _, _ := stmt.ToSql()
	log.WithField("query", queryStr).Debug("query!")

	// Query db
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return nil, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate listing structs
	listings := make([]*Listing, 0)
	for rows.Next() {
		l := new(Listing)
		err := rows.Scan(
			&l.KeyID,
			&l.CreationDate,
			&l.LastModificationDate,
			&l.Title,
			&l.Description,
			&l.UserID,
			&l.Username,
			&l.Price,
			&l.Status,
			&l.ExpirationDate,
			&l.Thumbnail,
			&l.IsStarred,
			&l.Photos,
		)
		if err != nil {
			return nil, err, http.StatusInternalServerError
		}
		listings = append(listings, l)
	}

	if err = rows.Err(); err != nil {
		return nil, err, http.StatusInternalServerError
	}

	return listings, nil, http.StatusOK
}

// Returns the most recent count listings, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func ReadListing(db *sql.DB, id string) (Listing, error, int) {
	var listing Listing

	// Create listing query
	query := psql.
		Select(
			"listings.key_id",
			"listings.creation_date",
			"listings.last_modification_date",
			"title",
			"description",
			"user_id",
			"users.net_id",
			"price",
			"status",
			"expiration_date",
			"thumbnail_url",
			"photos",
		).
		From("listings").
		Where("listings.is_active=true").
		LeftJoin("users ON listings.user_id = users.key_id").
		Where(sq.Eq{"listings.key_id": id})

	// Query db for listing
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return listing, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate listing struct
	rows.Next()
	err = rows.Scan(
		&listing.KeyID,
		&listing.CreationDate,
		&listing.LastModificationDate,
		&listing.Title,
		&listing.Description,
		&listing.UserID,
		&listing.Username,
		&listing.Price,
		&listing.Status,
		&listing.ExpirationDate,
		&listing.Thumbnail,
		&listing.Photos,
	)
	if err == sql.ErrNoRows {
		return listing, err, http.StatusNotFound
	} else if err != nil {
		return listing, err, http.StatusInternalServerError
	}

	return listing, nil, http.StatusOK
}

// Inserts the given listing (belonging to userId) into the database. Returns
// listing with its new KeyID added.
func CreateListing(db *sql.DB, listing Listing, userId int) (Listing, error, int) {
	listing.UserID = userId

	if listing.Photos == nil {
		listing.Photos = []string{}
	}

	// Insert listing
	stmt := psql.Insert("listings").
		Columns("title", "description", "user_id", "price", "status",
			"expiration_date", "thumbnail_url", "photos").
		Values(listing.Title, listing.Description, userId, listing.Price,
			listing.Status, listing.ExpirationDate, listing.Thumbnail, listing.Photos).
		Suffix("RETURNING key_id, creation_date")

	// Add listing to database, retrieve the one we just added (now with a key_id)
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return listing, err, http.StatusInternalServerError
	}
	defer rows.Close()
	rows.Next()
	err = rows.Scan(&listing.KeyID, &listing.CreationDate)
	if err != nil {
		return listing, err, http.StatusInternalServerError
	}

	// Insert listing into "caching" table for saved searches to run against
	stmt = psql.Insert("new_listings").
		Columns("key_id", "creation_date", "title", "description", "user_id", "price", "status",
			"expiration_date", "thumbnail_url", "photos").
		Values(listing.KeyID, listing.CreationDate, listing.Title, listing.Description, userId, listing.Price,
			listing.Status, listing.ExpirationDate, listing.Thumbnail, listing.Photos)

	// Populate listing struct
	_, err = stmt.RunWith(db).Exec()
	if err != nil {
		return listing, err, http.StatusInternalServerError
	}

	// Send email(s) if this listing matches anyone's saved search.
	go CheckNewListing(db, listing)
	return listing, nil, http.StatusCreated
}

// Overwrites the listing in the database with the given id with the given listing
// (belonging to userId). Returns the updated listing.
func UpdateListing(db *sql.DB, id string, listing Listing, userId int) (error, int) {
	listing.UserID = userId

	// Update listing
	stmt := psql.Update("listings").
		SetMap(map[string]interface{}{
			"title":           listing.Title,
			"description":     listing.Description,
			"price":           listing.Price,
			"status":          listing.Status,
			"expiration_date": listing.ExpirationDate,
			"thumbnail_url":   listing.Thumbnail,
			"photos":          listing.Photos}).
		Where(sq.Eq{"listings.key_id": id,
			"listings.user_id": userId})

	// Update listing
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// Deletes the listing in the database with the given id with the given listing
// (belonging to userId).
func DeleteListing(db *sql.DB, id string, userId int) (error, int) {
	// Delete listing
	stmt := psql.Delete("listings").
		Where(sq.Eq{"listings.key_id": id,
			"listings.user_id": userId})
	result, err := stmt.RunWith(db).Exec()

	// Remove from cache table if necessary
	stmt = psql.Delete("new_listings").
		Where(sq.Eq{"new_listings.key_id": id,
			"new_listings.user_id": userId})
	stmt.RunWith(db).Exec()

	return getUpdateResultCode(result, err)
}

// SetStar adds or removes a star, depending on whether add is set to true.
func SetStar(db *sql.DB, add bool, listingId string, userId int) (error, int) {
	if add {
		return addStar(db, listingId, userId)
	} else {
		return removeStar(db, listingId, userId)
	}
}

// addStar adds a star to the table for the given listingId and userId.
func addStar(db *sql.DB, listingId string, userId int) (error, int) {
	insertStarStmt := psql.Insert("starred_listings").
		Columns("user_id", "listing_id").
		Values(userId, listingId)

	// Query db for listing
	result, err := insertStarStmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// removeStar remvoes a star from the given listingId for a given userId.
func removeStar(db *sql.DB, listingId string, userId int) (error, int) {
	stmt := psql.Delete("starred_listings").
		Where(sq.Eq{"listing_id": listingId, "user_id": userId})

	// Query db for listing
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}
