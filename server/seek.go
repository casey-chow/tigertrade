package server

import (
	"fmt"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/getsentry/raven-go"
	"github.com/guregu/null"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
)

const defaultNumSeeks = 30
const maxNumSeeks = 100

// This is the "JSON" struct that appears in the array returned by getRecentSeeks
type SeeksItem struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	LastModificationDate null.Time   `json:"lastModificationDate"`
	Title                string      `json:"title"`
	Description          null.String `json:"description"` // expect to be truncated
	UserID               int         `json:"userId"`
	SavedSearchID        int         `json:"savedSearchId"`
	NotifyEnabled        bool        `json:"notifyEnabled"`
	Status               null.String `json:"status"`
}
// TODO Maybe use the same struct for both of these? The only difference is truncation of the descrip
// Returned by a getById function
type Seek struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	LastModificationDate null.Time   `json:"lastModificationDate"`
	Title                string      `json:"title"`
	Description          null.String `json:"description"`
	UserID               int         `json:"userId"`
	SavedSearchID        int         `json:"savedSearchId"`
	NotifyEnabled        bool        `json:"notifyEnabled"`
	Status               null.String `json:"status"`
}

// Writes the most recent count seeks, based on original date created to w
func ServeRecentSeeks(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	// Get limit from params
	limitStr := r.URL.Query().Get("limit")
	limit := defaultNumSeeks
	var e error
	if limitStr != "" {
		limit, e = strconv.Atoi(limitStr)
		if e != nil || limit == 0 {
			limit = defaultNumSeeks
		}
	}
	if limit > maxNumSeeks {
		limit = maxNumSeeks
	}

	seeks, err, code := GetRecentSeeks(maxDescriptionSize, uint64(limit))
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, seeks)
}

// Returns the most recent count seeks, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func GetRecentSeeks(maxDescriptionSize int, limit uint64) ([]*SeeksItem, error, int) {
	// Create seeks query
	query := psql.
		Select("seeks.key_id", "seeks.creation_date", "seeks.last_modification_date",
			"title", fmt.Sprintf("left(description, %d)", maxDescriptionSize),
			"user_id", "saved_search_id", "notidy_enabled", "status").
		From("seeks").
		Where("seeks.is_active=true").
		OrderBy("seeks.creation_date DESC").
		Limit(limit)

	// Query db
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return nil, err, 500
	}
	defer rows.Close()

	// Populate seek structs
	seeks := make([]*SeeksItem, 0)
	for rows.Next() {
		l := new(SeeksItem)
		err := rows.Scan(&l.KeyID, &l.CreationDate, &l.LastModificationDate,
			&l.Title, &l.Description, &l.UserID, &l.SavedSearchID,
			&l.NotifyEnabled, &l.Status)
		if err != nil {
			return nil, err, 500
		}
		seeks = append(seeks, l)
	}
	if err = rows.Err(); err != nil {
		return nil, err, 500
	}

	return seeks, nil, 0
}

// Writes the most recent count seeks, based on original date created to w
func ServeSeekById(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
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

	seeks, err, code := GetSeekById(id)
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, seeks)
}

// Returns the most recent count seeks, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func GetSeekById(id string) (Seek, error, int) {
	var seek Seek

	// Create seek query
	query := psql.
		Select("seeks.key_id", "seeks.creation_date",
		       "seeks.last_modification_date", "title", "description", "user_id",
		"saved_search_id", "notidy_enabled", "status").
		From("seeks").
		Where("seeks.is_active=true").
		Where(sq.Eq{"seeks.key_id": id})

	// Query db for seek
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return seek, err, 500
	}
	defer rows.Close()

	// Populate seek struct
	rows.Next()
	err := rows.Scan(&l.KeyID, &l.CreationDate, &l.LastModificationDate,
                        &l.Title, &l.Description, &l.UserID, &l.SavedSearchID,
                        &l.NotifyEnabled, &l.Status)
	if err != nil {
		return seek, err, 500
	}

	return seek, nil, 0
}

func ServeAddSeek(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

	if r.Method != "POST" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	// Get seek to add from request body
	seek := seek{}
	// TODO this fails silently for some reason if r.Body contains invalid JSON
	json.NewDecoder(r.Body).Decode(&seek)

	// Retrieve UserID
	user, err := getUser(getUsername(r))
	if err != nil { // Not authorized
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(401), 401)
	}

	seek, err, code := AddSeek(seek, user.KeyID)
	if err != nil {
		raven.CaptureError(err, nil)
		log.Print(err)
		http.Error(w, http.StatusText(code), code)
	}

	Serve(w, seek)
}

// Inserts the given seek (belonging to userId) into the database. Returns
// seek with its new KeyID added.
func AddSeek(seek Seek, userId int) (Seek, error, int) {
	listing.UserID = userId

	// Insert seek
	stmt := psql.Insert("seeks").
		Columns("title", "description", "user_id", "price", "status", "expiration_date", "thumbnail_id").
		Values(listing.Title, listing.Description, userId, listing.Price, listing.Status, listing.ExpirationDate, listing.Thumbnail).
		Suffix("RETURNING key_id")

	// Query db for listing
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return listing, err, 500
	}
	defer rows.Close()

	// Populate listing struct
	rows.Next()
	err = rows.Scan(&listing.KeyID)
	if err != nil {
		return listing, err, 500
	}

	return listing, nil, 0
}
