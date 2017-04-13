package server

import (
	"encoding/json"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/getsentry/raven-go"
	"github.com/guregu/null"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

// Returned by a getById function and by getSavedSearches
type SavedSearch struct {
	KeyID                 int         `json:"keyId"`
	CreationDate          null.Time   `json:"creationDate"`
	LastModificationDate  null.Time   `json:"lastModificationDate"`
	UserID                int         `json:"userId"`
	Query                 null.String `json:"query"`
	MinPrice              null.Int    `json:"min_price"`
	MaxPrice              null.Int    `json:"max_price"`
	ListingExpirationDate null.Time   `json:"listing_expiration_date"`
	SearchExpirationDate  null.Time   `json:"search_expiration_date"`
}

// Writes the most recent count saved searches, based on original date created to w
func ServeRecentSavedSearches(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	savedSearches, err, code := GetRecentSavedSearches(uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, savedSearches)
}

// Returns the most recent count saved searches, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func GetRecentSavedSearches(limit uint64) ([]*SavedSearch, error, int) {
	// Create saved searches query
	query := psql.
		Select("saved_searches.key_id", "saved_searches.creation_date", "saved_searches.last_modification_date",
			"user_id", "query", "min_price", "max_price", "listing_expiration_date", "search_expiration_date").
		From("saved_searches").
		Where("saved_searches.is_active=true").
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
			&ss.UserID, &ss.Query, &ss.MinPrice, &ss.MaxPrice,
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

// Writes the most recent count saved searches, based on original date created to w
func ServeSavedSearchById(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	savedSearches, err, code := GetSavedSearchById(id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, savedSearches)
}

// Returns the most recent count saved searches, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func GetSavedSearchById(id string) (SavedSearch, error, int) {
	var savedSearch SavedSearch

	// Create saved search query
	query := psql.
		Select("saved_searches.key_id", "saved_searches.creation_date", "saved_searches.last_modification_date",
			"user_id", "query", "min_price", "max_price", "listing_expiration_date", "search_expiration_date").
		From("saved_searches").
		Where("saved_searches.is_active=true").
		Where(sq.Eq{"saved_searches.key_id": id})

	// Query db for savedSearch
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return savedSearch, err, 500
	}
	defer rows.Close()

	// Populate savedSearch struct
	rows.Next()
	err = rows.Scan(&savedSearch.KeyID, &savedSearch.CreationDate, &savedSearch.LastModificationDate,
		&savedSearch.UserID, &savedSearch.Query, &savedSearch.MinPrice, &savedSearch.MaxPrice,
		&savedSearch.ListingExpirationDate, &savedSearch.SearchExpirationDate)
	if err != nil {
		return savedSearch, err, 500
	}

	return savedSearch, nil, 0
}

func ServeAddSavedSearch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	// Get saved search to add from request body
	savedSearch := SavedSearch{}
	// TODO this fails silently for some reason if r.Body contains invalid JSON
	json.NewDecoder(r.Body).Decode(&savedSearch)

	// Retrieve UserID
	user, err := getUser(getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(401), 401)
	}

	savedSearch, err, code := AddSavedSearch(savedSearch, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, savedSearch)
}

// Inserts the given saved search (belonging to userId) into the database. Returns
// saved search with its new KeyID added.
func AddSavedSearch(savedSearch SavedSearch, userId int) (SavedSearch, error, int) {
	savedSearch.UserID = userId

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