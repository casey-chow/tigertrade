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

// A Listing is a record type storing a row of the listings table
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

// GetCreationDate returns the CreationDate of the Listing
func (l Listing) GetCreationDate() null.Time {
	return l.CreationDate
}

// GetLastModificationDate returns the LastModificationDate of the Listing
func (l Listing) GetLastModificationDate() null.Time {
	return l.LastModificationDate
}

// GetTitle returns the Title of the Listing
func (l Listing) GetTitle() string {
	return l.Title
}

// GetDescription returns the Description of the Listing
func (l Listing) GetDescription() null.String {
	return l.Description
}

// GetUserID returns the UserID of the Listing
func (l Listing) GetUserID() int {
	return l.UserID
}

// GetUsername returns the Username of the Listing
func (l Listing) GetUsername() null.String {
	return l.Username
}

// GetStatus returns the Status of the Listing
func (l Listing) GetStatus() null.String {
	return l.Status
}

// A ListingQuery contains the necessary parameters for a parametrized query of the listings table
type ListingQuery struct {
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

// NewListingQuery creates a LisitngQuery with the appropriate default values
func NewListingQuery() *ListingQuery {
	q := new(ListingQuery)
	q.TruncationLength = defaultTruncationLength
	q.Limit = defaultNumResults
	q.MinPrice = -1
	q.MaxPrice = -1
	return q
}

// An IsStarred is the body of a request to SetStar
type IsStarred struct {
	IsStarred bool `json:"isStarred"`
}

// Returns the SQL query that returns true if a particular listing is starred
// by the user with key_id id. This method exists because dealing with nested
// SQL queries in squirrel is an ugly pain in the ass
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

// ReadListings performs a customizable request for a collection of listings, as specified by a ListingQuery
func ReadListings(db *sql.DB, query *ListingQuery) ([]*Listing, int, error) {
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

	for _, word := range strings.Fields(query.Query) {
		stmt = stmt.Where("(lower(listings.title) LIKE lower(?) OR lower(listings.description) LIKE lower(?))", fmt.Sprint("%", word, "%"), fmt.Sprint("%", word, "%"))
	}

	if query.UserID == 0 && (query.OnlyStarred || query.OnlyMine) {
		return nil, http.StatusUnauthorized, errors.New("unauthenticated user attempted to view profile data")
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
		return nil, http.StatusInternalServerError, err
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
			return nil, http.StatusInternalServerError, err
		}
		listings = append(listings, l)
	}

	if err = rows.Err(); err != nil {
		return nil, http.StatusInternalServerError, err
	}

	return listings, http.StatusOK, nil
}

// ReadListing returns the listing with the given ID
func ReadListing(db *sql.DB, id string) (Listing, int, error) {
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
		return listing, http.StatusInternalServerError, err
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
		return listing, http.StatusNotFound, err
	} else if err != nil {
		return listing, http.StatusInternalServerError, err
	}

	return listing, http.StatusOK, nil
}

// CreateListing inserts the given listing (belonging to userID) into the database.
// Returns the listing with its new KeyID added
func CreateListing(db *sql.DB, listing Listing, userID int) (Listing, int, error) {
	listing.UserID = userID

	if listing.Photos == nil {
		listing.Photos = []string{}
	}

	// Insert listing
	stmt := psql.Insert("listings").
		Columns(
			"title",
			"description",
			"user_id",
			"price",
			"status",
			"expiration_date",
			"thumbnail_url",
			"photos",
		).
		Values(
			listing.Title,
			listing.Description,
			userID,
			listing.Price,
			listing.Status,
			listing.ExpirationDate,
			listing.Thumbnail,
			listing.Photos,
		).
		Suffix("RETURNING key_id, creation_date")

	// Add listing to database, retrieve the one we just added (now with a key_id)
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return listing, http.StatusInternalServerError, err
	}
	defer rows.Close()

	rows.Next()
	err = rows.Scan(
		&listing.KeyID,
		&listing.CreationDate,
	)
	if err != nil {
		return listing, http.StatusInternalServerError, err
	}

	// Send email(s) if this listing matches anyone's saved search.
	go CheckNewListing(db, listing)
	return listing, http.StatusCreated, nil
}

// UpdateListing overwrites the listing in the database with the given id with the given listing
func UpdateListing(db *sql.DB, id string, listing Listing, userID int) (int, error) {
	listing.UserID = userID

	// Update listing
	stmt := psql.Update("listings").
		SetMap(map[string]interface{}{
			"title":           listing.Title,
			"description":     listing.Description,
			"price":           listing.Price,
			"status":          listing.Status,
			"expiration_date": listing.ExpirationDate,
			"thumbnail_url":   listing.Thumbnail,
			"photos":          listing.Photos,
		}).
		Where(sq.Eq{
			"listings.key_id":  id,
			"listings.user_id": userID,
		})

	// Update listing
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// DeleteListing deletes the listing in the database with the given id
func DeleteListing(db *sql.DB, id string, userID int) (int, error) {
	// Delete listing
	stmt := psql.Delete("listings").
		Where(sq.Eq{
			"listings.key_id":  id,
			"listings.user_id": userID,
		})
	result, err := stmt.RunWith(db).Exec()

	return getUpdateResultCode(result, err)
}

// SetStar adds or removes a star, depending on whether add is set to true
func SetStar(db *sql.DB, add bool, listingID string, userID int) (int, error) {
	var code int
	var err error
	if add {
		code, err = addStar(db, listingID, userID)
	} else {
		code, err = removeStar(db, listingID, userID)
	}
	return code, err
}

// addStar adds a star to the table for the given listingID and userID
func addStar(db *sql.DB, listingID string, userID int) (int, error) {
	insertStarStmt := psql.Insert("starred_listings").
		Columns(
			"user_id",
			"listing_id",
		).
		Values(
			userID,
			listingID,
		).
		Suffix("ON CONFLICT DO NOTHING")

	// Query db for listing
	result, err := insertStarStmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// removeStar removes a star from the given listingID for a given userID
func removeStar(db *sql.DB, listingID string, userID int) (int, error) {
	stmt := psql.Delete("starred_listings").
		Where(sq.Eq{
			"listing_id": listingID,
			"user_id":    userID,
		})

	// Query db for listing
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}
