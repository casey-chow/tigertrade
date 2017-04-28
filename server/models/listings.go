package models

import (
	"database/sql"
	"errors"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	"github.com/guregu/null"
	"net/http"
	"strconv"
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
	Username             null.String `json:"username"`
	Price                null.Int    `json:"price"`
	Status               null.String `json:"status"`
	ExpirationDate       null.Time   `json:"expirationDate"`
	Thumbnail            null.String `json:"thumbnail"`
	IsStarred            bool        `json:"isStarred"`
}

// Returned by a function returning only one listing (usually by ID)
type Listing struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	LastModificationDate null.Time   `json:"lastModificationDate"`
	Title                string      `json:"title"`
	Description          null.String `json:"description"`
	UserID               int         `json:"userId"`
	Username             null.String `json:"username"`
	Price                null.Int    `json:"price"`
	Status               null.String `json:"status"`
	ExpirationDate       null.Time   `json:"expirationDate"`
	Thumbnail            null.String `json:"thumbnail"`
	Photos               []Photo     `json:"photos"`
	IsStarred            bool        `json:"isStarred"`
}

type listingQuery struct {
	Query            string
	OnlyStarred      bool
	OnlyMine         bool
	TruncationLength int
	Limit            uint64
	UserID           int
}

func NewListingQuery() *listingQuery {
	q := new(listingQuery)
	q.TruncationLength = defaultTruncationLength
	q.Limit = defaultNumResults
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
	return "exists(  SELECT 1 FROM starred_listings " +
		"WHERE starred_listings.listing_id=listings.key_id " +
		"AND starred_listings.user_id=" + strconv.Itoa(id) + " " +
		"AND starred_listings.is_active)"
}

// Returns the most recent count listings, based on original date created.
// If queryStr is nonempty, filters that every returned item must have every word in either title or description
// On error, returns an error and the HTTP code associated with that error.
func ReadListings(db *sql.DB, query *listingQuery) ([]*ListingsItem, error, int) {
	// Create listings statement
	stmt := psql.
		Select("listings.key_id", "listings.creation_date",
			"listings.last_modification_date", "title",
			fmt.Sprintf("left(description, %d)", query.TruncationLength), "user_id",
			"users.net_id", "price", "status", "expiration_date", "thumbnails.url",
			isStarredBy(query.UserID)).
		From("listings").
		Where("listings.is_active=true").
		LeftJoin("users ON listings.user_id = users.key_id").
		LeftJoin("thumbnails ON listings.thumbnail_id = thumbnails.key_id")

	for i, word := range strings.Fields(query.Query) {
		stmt = stmt.Where(fmt.Sprintf("(lower(listings.title) LIKE lower($%d) OR lower(listings.description) LIKE lower($%d))", i+1, i+1), fmt.Sprint("%", word, "%"))
	}

	if query.UserID == 0 && (query.OnlyStarred || query.OnlyMine) {
		return nil, errors.New("Unauthenticated user attempted to view profile data"), http.StatusUnauthorized
	}

	if query.OnlyStarred {
		stmt = stmt.Where(isStarredBy(query.UserID))
	}

	if query.OnlyMine {
		stmt = stmt.Where(sq.Eq{"user_id": query.UserID})
	}

	stmt = stmt.OrderBy("listings.creation_date DESC")
	if query.Limit <= maxNumResults {
		stmt = stmt.Limit(query.Limit)
	} else {
		stmt = stmt.Limit(maxNumResults)
	}

	// Query db
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return nil, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate listing structs
	listings := make([]*ListingsItem, 0)
	for rows.Next() {
		l := new(ListingsItem)
		err := rows.Scan(&l.KeyID, &l.CreationDate, &l.LastModificationDate,
			&l.Title, &l.Description, &l.UserID, &l.Username, &l.Price, &l.Status,
			&l.ExpirationDate, &l.Thumbnail, &l.IsStarred)
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
		Select("listings.key_id", "listings.creation_date", "listings.last_modification_date",
			"title", "description", "user_id", "users.net_id", "price", "status", "expiration_date",
			"thumbnails.url").
		From("listings").
		Where("listings.is_active=true").
		LeftJoin("users ON listings.user_id = users.key_id").
		LeftJoin("thumbnails ON listings.thumbnail_id = thumbnails.key_id").
		Where(sq.Eq{"listings.key_id": id})

	// Query db for listing
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return listing, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate listing struct
	rows.Next()
	err = rows.Scan(&listing.KeyID, &listing.CreationDate,
		&listing.LastModificationDate, &listing.Title, &listing.Description,
		&listing.UserID, &listing.Username, &listing.Price, &listing.Status,
		&listing.ExpirationDate, &listing.Thumbnail)
	if err == sql.ErrNoRows {
		return listing, err, http.StatusNotFound
	} else if err != nil {
		return listing, err, http.StatusInternalServerError
	}

	// Add photos to struct
	photos, err, code := ReadListingPhotos(db, id)
	if err != nil {
		return listing, err, code
	}
	for i := range photos {
		listing.Photos = append(listing.Photos, *photos[i])
	}

	return listing, nil, http.StatusOK
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

	// Add listing to database, retrieve the one we just added (now with a key_id)
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return listing, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate listing struct
	rows.Next()
	err = rows.Scan(&listing.KeyID, &listing.CreationDate)
	if err != nil {
		return listing, err, http.StatusInternalServerError
	}

	return listing, nil, http.StatusOK
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
			"price":           listing.Price,
			"status":          listing.Status,
			"expiration_date": listing.ExpirationDate,
			"thumbnail_id":    listing.Thumbnail}).
		Where(sq.Eq{"listings.key_id": id,
			"listings.user_id": userId})

	// Update listing
	result, err := stmt.RunWith(db).Exec()
	code, err := getUpdateResultCode(result, err)

	if err != nil {
		return listing, err, code
	}

	return ReadListing(db, id)
}

// Deletes the listing in the database with the given id with the given listing
// (belonging to userId).
func DeleteListing(db *sql.DB, id string, userId int) (error, int) {
	// Update listing
	stmt := psql.Delete("listings").
		Where(sq.Eq{"listings.key_id": id,
			"listings.user_id": userId})

	// Query db for listing
	result, err := stmt.RunWith(db).Exec()
	code, err := getUpdateResultCode(result, err)

	return err, code
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
	code, err := getUpdateResultCode(result, err)

	return err, code
}

// removeStar remvoes a star from the given listingId for a given userId.
func removeStar(db *sql.DB, listingId string, userId int) (error, int) {
	stmt := psql.Update("starred_listings").
		SetMap(map[string]interface{}{
			"is_active": false,
		}).
		Where(sq.Eq{"listing_id": listingId, "user_id": userId})

	// Query db for listing
	result, err := stmt.RunWith(db).Exec()
	code, err := getUpdateResultCode(result, err)

	return err, code
}
