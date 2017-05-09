package models

import (
	"database/sql"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/guregu/null"
	"net/http"
)

// A SavedSearch is a record type storing a row of the saved searches table
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

// A SavedSearchQuery contains the necessary parameters for a parametrized query of the saved searches table
type SavedSearchQuery struct {
	Limit  uint64 // maximum number of listings to return
	Offset uint64 // offset in search results to send
	UserID int
}

// NewSavedSearchQuery makes a new SavedSearchQuery with the appropriate default vlaues
func NewSavedSearchQuery() *SavedSearchQuery {
	q := new(SavedSearchQuery)
	q.Limit = defaultNumResults
	return q
}

// ReadSavedSearches performs a customizable request for a collection of saved searches, as specified by a SavedSearchQuery
func ReadSavedSearches(db *sql.DB, query *SavedSearchQuery) ([]*SavedSearch, int, error) {
	// Create saved searches statement
	stmt := psql.
		Select(
			"saved_searches.key_id",
			"saved_searches.creation_date",
			"saved_searches.last_modification_date",
			"query",
			"min_price",
			"max_price",
			"listing_expiration_date",
			"search_expiration_date",
		).
		From("saved_searches").
		Where(sq.Eq{
			"saved_searches.user_id":   query.UserID,
			"saved_searches.is_active": true,
		}).
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
		return nil, http.StatusInternalServerError, err
	}
	defer rows.Close()

	// Populate saved search structs
	savedSearches := make([]*SavedSearch, 0)
	for rows.Next() {
		ss := new(SavedSearch)
		err := rows.Scan(
			&ss.KeyID,
			&ss.CreationDate,
			&ss.LastModificationDate,
			&ss.Query,
			&ss.MinPrice,
			&ss.MaxPrice,
			&ss.ListingExpirationDate,
			&ss.SearchExpirationDate,
		)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}
		savedSearches = append(savedSearches, ss)
	}
	if err = rows.Err(); err != nil {
		return nil, http.StatusInternalServerError, err
	}

	return savedSearches, http.StatusOK, nil
}

// ReadSavedSearch returns the listing with the given ID
func ReadSavedSearch(db *sql.DB, id string, userID int) (SavedSearch, int, error) {
	var savedSearch SavedSearch

	// Create saved search query
	query := psql.
		Select(
			"saved_searches.key_id",
			"saved_searches.creation_date",
			"saved_searches.last_modification_date",
			"query",
			"min_price",
			"max_price",
			"listing_expiration_date",
			"search_expiration_date",
		).
		From("saved_searches").
		Where(sq.Eq{
			"saved_searches.is_active": true,
			"saved_searches.key_id":    id,
			"saved_searches.user_id":   userID,
		})

	// Query db for savedSearch
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return savedSearch, http.StatusInternalServerError, err
	}
	defer rows.Close()

	// Populate savedSearch struct
	rows.Next()
	err = rows.Scan(
		&savedSearch.KeyID,
		&savedSearch.CreationDate,
		&savedSearch.LastModificationDate,
		&savedSearch.Query,
		&savedSearch.MinPrice,
		&savedSearch.MaxPrice,
		&savedSearch.ListingExpirationDate,
		&savedSearch.SearchExpirationDate,
	)
	if err == sql.ErrNoRows {
		return savedSearch, http.StatusNotFound, err
	} else if err != nil {
		return savedSearch, http.StatusInternalServerError, err
	}

	return savedSearch, http.StatusOK, nil
}

// CreateSavedSearch inserts the given saved search (belonging to userID) into the database.
// Returns the Saved Search with its new KeyID added
func CreateSavedSearch(db *sql.DB, savedSearch SavedSearch, userID int) (SavedSearch, int, error) {
	// Insert saved search
	stmt := psql.Insert("saved_searches").
		Columns(
			"user_id",
			"query",
			"min_price",
			"max_price",
			"listing_expiration_date",
			"search_expiration_date",
		).
		Values(
			userID,
			savedSearch.Query,
			savedSearch.MinPrice,
			savedSearch.MaxPrice,
			savedSearch.ListingExpirationDate,
			savedSearch.SearchExpirationDate,
		).
		Suffix("RETURNING key_id, creation_date")

	// Query db for saved search
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return savedSearch, http.StatusInternalServerError, err
	}
	defer rows.Close()

	// Populate saved search struct
	rows.Next()
	err = rows.Scan(
		&savedSearch.KeyID,
		&savedSearch.CreationDate,
	)
	if err != nil {
		return savedSearch, http.StatusInternalServerError, err
	}

	return savedSearch, http.StatusCreated, nil
}

// UpdateSavedSearch overwrites the saved search in the database with the given id with the given saved search
func UpdateSavedSearch(db *sql.DB, id string, savedSearch SavedSearch, userID int) (int, error) {
	// Update savedSearch
	stmt := psql.Update("saved_searches").
		SetMap(map[string]interface{}{
			"user_id":                 userID,
			"query":                   savedSearch.Query,
			"min_price":               savedSearch.MinPrice,
			"max_price":               savedSearch.MaxPrice,
			"listing_expiration_date": savedSearch.ListingExpirationDate,
			"search_expiration_date":  savedSearch.SearchExpirationDate,
		}).
		Where(sq.Eq{
			"saved_searches.key_id":  id,
			"saved_searches.user_id": userID,
		})

	// Query db for savedSearch
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// DeleteSavedSearch deletes the saved search in the database with the given id
func DeleteSavedSearch(db *sql.DB, id string, userID int) (int, error) {
	// Update savedSearch
	stmt := psql.Delete("saved_searches").
		Where(sq.Eq{
			"saved_searches.key_id":  id,
			"saved_searches.user_id": userID,
		})

	// Query db for savedSearch
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// CheckNewListing checks a given listing against all saved searches and emails
// users whose saved search matches the new listing
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
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		log.WithError(err).Error("error while checking for new listings")
		return
	}
	defer rows.Close()

	// Send emails
	email := new(EmailInput)
	email.Subject = listing.Title
	if listing.Description.IsZero() {
		email.Body = "(no description provided)"
	} else {
		email.Body = *listing.Description.Ptr()
	}
	email.IsSavedSearch = true

	matchCount := 0
	for rows.Next() {
		matchCount++
		var userID int
		if err := rows.Scan(&userID); err != nil {
			log.WithError(err).Error("error while finding matches in new listings check")
			continue
		}

		owner, err := GetUserByID(db, userID)
		if err != nil {
			log.WithError(err).Error("error while finding user in new listings check")
			continue
		}

		email.Recipient = owner.NetID
		SendEmail(email)
	}

	log.Infof("saved searches: found %d results", matchCount)
}
