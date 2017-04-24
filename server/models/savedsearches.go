package models

import (
	"database/sql"
	sq "github.com/Masterminds/squirrel"
	"github.com/guregu/null"
)

// Returned by a getById function and by getSavedSearches
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

// Returns the most recent count saved searches, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func ReadSavedSearches(db *sql.DB, userId int, limit uint64) ([]*SavedSearch, error, int) {
	// Create saved searches query
	query := psql.
		Select("saved_searches.key_id", "saved_searches.creation_date", "saved_searches.last_modification_date",
			"query", "min_price", "max_price", "listing_expiration_date", "search_expiration_date").
		From("saved_searches").
		Where(sq.Eq{"saved_searches.user_id": userId,
			"saved_searches.is_active": true}).
		OrderBy("saved_searches.creation_date DESC").
		Limit(limit)

	// Query db
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return nil, err, 500
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
			return nil, err, 500
		}
		savedSearches = append(savedSearches, ss)
	}
	if err = rows.Err(); err != nil {
		return nil, err, 500
	}

	return savedSearches, nil, 0
}

// Returns the most recent count saved searches, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func ReadSavedSearch(db *sql.DB, id string, userId int) (SavedSearch, error, int) {
	var savedSearch SavedSearch

	// Create saved search query
	query := psql.
		Select("saved_searches.key_id", "saved_searches.creation_date", "saved_searches.last_modification_date",
			"query", "min_price", "max_price", "listing_expiration_date", "search_expiration_date").
		From("saved_searches").
		Where(sq.Eq{"saved_searches.is_active": true,
			"saved_searches.key_id":  id,
			"saved_searches.user_id": userId})

	// Query db for savedSearch
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return savedSearch, err, 500
	}
	defer rows.Close()

	// Populate savedSearch struct
	rows.Next()
	err = rows.Scan(&savedSearch.KeyID, &savedSearch.CreationDate, &savedSearch.LastModificationDate,
		&savedSearch.Query, &savedSearch.MinPrice, &savedSearch.MaxPrice,
		&savedSearch.ListingExpirationDate, &savedSearch.SearchExpirationDate)
	if err != nil {
		return savedSearch, err, 500
	}

	return savedSearch, nil, 0
}

// Inserts the given saved search (belonging to userId) into the database. Returns
// saved search with its new KeyID added.
func CreateSavedSearch(db *sql.DB, savedSearch SavedSearch, userId int) (SavedSearch, error, int) {
	// Insert saved search
	stmt := psql.Insert("saved_searches").
		Columns("user_id", "query", "min_price", "max_price", "listing_expiration_date", "search_expiration_date").
		Values(userId, savedSearch.Query, savedSearch.MinPrice, savedSearch.MaxPrice, savedSearch.ListingExpirationDate, savedSearch.SearchExpirationDate).
		Suffix("RETURNING key_id")

	// Query db for saved search
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return savedSearch, err, 500
	}
	defer rows.Close()

	// Populate saved search struct
	rows.Next()
	err = rows.Scan(&savedSearch.KeyID)
	if err != nil {
		return savedSearch, err, 500
	}

	return savedSearch, nil, 0
}
