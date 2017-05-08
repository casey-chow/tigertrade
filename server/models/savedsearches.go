package models

import (
	"database/sql"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/guregu/null"
	"net/http"
)

// Returned by functions returning one or more saved searches
type SavedSearch struct {
	KeyID                 int         `json:"keyId"`
	CreationDate          null.Time   `json:"creationDate"`
	LastModificationDate  null.Time   `json:"lastModificationDate"`
	Query                 null.String `json:"query"`
	MinPrice              null.Int    `json:"minPrice"`
	MaxPrice              null.Int    `json:"maxPrice"`
	ListingExpirationDate null.Time   `json:"listingExpirationDate"`
	SearchExpirationDate  null.Time   `json:"searchExpirationDate"`
}

type savedSearchQuery struct {
	Limit  uint64 // maximum number of listings to return
	Offset uint64 // offset in search results to send
	UserID int
}

func NewSavedSearchQuery() *savedSearchQuery {
	q := new(savedSearchQuery)
	q.Limit = defaultNumResults
	return q
}

// Returns the most recent count saved searches, based on original date created.
// If queryStr is nonempty, filters that every returned item must have every word in either title or description
// On error, returns an error and the HTTP code associated with that error.
func ReadSavedSearches(db *sql.DB, query *savedSearchQuery) ([]*SavedSearch, error, int) {
	// Create saved searches statement
	stmt := psql.
		Select("saved_searches.key_id", "saved_searches.creation_date",
			"saved_searches.last_modification_date", "query", "min_price",
			"max_price", "listing_expiration_date", "search_expiration_date").
		From("saved_searches").
		Where(sq.Eq{"saved_searches.user_id": query.UserID,
			"saved_searches.is_active": true}).
		OrderBy("saved_searches.creation_date DESC")

	if query.Limit > defaultNumResults {
		stmt = stmt.Limit(query.Limit)
	} else {
		stmt = stmt.Limit(defaultNumResults)
	}

	stmt = stmt.Offset(query.Offset)

	// Query db
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return nil, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate saved search structs
	savedSearches := make([]*SavedSearch, 0)
	for rows.Next() {
		ss := new(SavedSearch)
		err := rows.Scan(&ss.KeyID, &ss.CreationDate, &ss.LastModificationDate,
			&ss.Query, &ss.MinPrice, &ss.MaxPrice,
			&ss.ListingExpirationDate, &ss.SearchExpirationDate)
		if err != nil {
			return nil, err, http.StatusInternalServerError
		}
		savedSearches = append(savedSearches, ss)
	}
	if err = rows.Err(); err != nil {
		return nil, err, http.StatusInternalServerError
	}

	return savedSearches, nil, http.StatusOK
}

// Returns the most recent count saved searches, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func ReadSavedSearch(db *sql.DB, id string, userId int) (SavedSearch, error, int) {
	var savedSearch SavedSearch

	// Create saved search query
	query := psql.
		Select("saved_searches.key_id", "saved_searches.creation_date",
			"saved_searches.last_modification_date", "query", "min_price",
			"max_price", "listing_expiration_date", "search_expiration_date").
		From("saved_searches").
		Where(sq.Eq{"saved_searches.is_active": true,
			"saved_searches.key_id":  id,
			"saved_searches.user_id": userId})

	// Query db for savedSearch
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return savedSearch, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate savedSearch struct
	rows.Next()
	err = rows.Scan(&savedSearch.KeyID, &savedSearch.CreationDate,
		&savedSearch.LastModificationDate, &savedSearch.Query,
		&savedSearch.MinPrice, &savedSearch.MaxPrice,
		&savedSearch.ListingExpirationDate, &savedSearch.SearchExpirationDate)
	if err == sql.ErrNoRows {
		return savedSearch, err, http.StatusNotFound
	} else if err != nil {
		return savedSearch, err, http.StatusInternalServerError
	}

	return savedSearch, nil, http.StatusOK
}

// Inserts the given saved search (belonging to userId) into the database. Returns
// saved search with its new KeyID added.
func CreateSavedSearch(db *sql.DB, savedSearch SavedSearch, userId int) (SavedSearch, error, int) {
	// Insert saved search
	stmt := psql.Insert("saved_searches").
		Columns("user_id", "query", "min_price", "max_price",
			"listing_expiration_date", "search_expiration_date").
		Values(userId, savedSearch.Query, savedSearch.MinPrice,
			savedSearch.MaxPrice, savedSearch.ListingExpirationDate,
			savedSearch.SearchExpirationDate).
		Suffix("RETURNING key_id, creation_date")

	// Query db for saved search
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return savedSearch, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate saved search struct
	rows.Next()
	err = rows.Scan(&savedSearch.KeyID, &savedSearch.CreationDate)
	if err != nil {
		return savedSearch, err, http.StatusInternalServerError
	}

	return savedSearch, nil, http.StatusCreated
}

// Overwrites the saved search in the database with the given id with the given saved search
// (belonging to userId). Returns the updated saved search.
func UpdateSavedSearch(db *sql.DB, id string, savedSearch SavedSearch, userId int) (error, int) {
	// Update savedSearch
	stmt := psql.Update("saved_searches").
		SetMap(map[string]interface{}{
			"user_id":                 userId,
			"query":                   savedSearch.Query,
			"min_price":               savedSearch.MinPrice,
			"max_price":               savedSearch.MaxPrice,
			"listing_expiration_date": savedSearch.ListingExpirationDate,
			"search_expiration_date":  savedSearch.SearchExpirationDate}).
		Where(sq.Eq{"saved_searches.key_id": id,
			"saved_searches.user_id": userId})

	// Query db for savedSearch
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// Deletes the saved search in the database with the given id with the given saved search
// (belonging to userId).
func DeleteSavedSearch(db *sql.DB, id string, userId int) (error, int) {
	// Update savedSearch
	stmt := psql.Delete("saved_searches").
		Where(sq.Eq{"saved_searches.key_id": id,
			"saved_searches.user_id": userId})

	// Query db for savedSearch
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// CheckNewListing checks a given listing against all saved searches and emails
// users whose saved search matches the new listing.
func CheckNewListing(db *sql.DB, listing Listing) {

	log.Info("Scanning for queries matching newly posted listing...")
	// Get all users with active nonexpired queries that would match the given
	stmt := psql.
		Select("DISTINCT on (user_id) user_id").
		From("saved_searches").
		Where(sq.Eq{"saved_searches.is_active": true}).
		Where("search_expiration_date > now() OR search_expiration_date IS NULL")

	// WARNING changes here will also require changes in listings.ReadListings.
	// If this is ever changed, we should really just refactor it into a
	// separate function that can be easily shared
	stmt = stmt.Where("string_to_array(lower(query), ' ') <@ (string_to_array(lower(?), ' ') || string_to_array(lower(?), ' '));", listing.Title, listing.Description)
	// By the way, we wouldn't have to repeatedly call string_to_array if we were
	// storing things as arrays of words to begin with, and we should change that
	// after the demo.

	// Query db
	log.Info(stmt.ToSql())
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return
	}
	defer rows.Close()

	// Send emails
	email := new(emailInput)
	email.Subject = listing.Title
	if listing.Description.IsZero() {
		email.Body = "(no description provided)"

	} else {
		email.Body = *listing.Description.Ptr()
	}
	email.IsSavedSearch = true
	var matchCount int = 0
	for rows.Next() {
		matchCount += 1
		var userID int
		err := rows.Scan(&userID)
		if err != nil {
			log.Warn(err)
			break
		}

		if owner, err := GetUserByID(db, userID); err != nil {
			log.Warn(err)
			break
		} else {
			email.Recipient = owner.NetID
		}
		SendEmail(email)
	}

	log.Info(fmt.Printf("found %d results", matchCount))

}
