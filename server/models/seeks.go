package models

import (
	"database/sql"
	"errors"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	"github.com/guregu/null"
	"net/http"
	"strings"
)

// Returned by a function returning only one seek (usually by ID)
type Seek struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	LastModificationDate null.Time   `json:"lastModificationDate"`
	Title                string      `json:"title"`
	Description          null.String `json:"description"`
	UserID               int         `json:"userId"`
	Username             null.String `json:"username"`
	SavedSearchID        null.Int    `json:"savedSearchId"`
	NotifyEnabled        null.Bool   `json:"notifyEnabled"`
	Status               null.String `json:"status"`
}

type seekQuery struct {
	Query            string
	OnlyMine         bool
	TruncationLength int    // number of characters to truncate listing descriptions to
	Limit            uint64 // maximum number of listings to return
	Offset           uint64 // offset in search results to send
	UserID           int
}

func NewSeekQuery() *seekQuery {
	q := new(seekQuery)
	q.TruncationLength = defaultTruncationLength
	q.Limit = defaultNumResults
	q.Offset = 0
	return q
}

// Returns the most recent count seeks, based on original date created.
// If queryStr is nonempty, filters that every returned item must have every word in either title or description
// On error, returns an error and the HTTP code associated with that error.
func ReadSeeks(db *sql.DB, query *seekQuery) ([]*Seek, error, int) {
	// Create seeks statement
	stmt := psql.
		Select("seeks.key_id", "seeks.creation_date", "seeks.last_modification_date",
			"title", fmt.Sprintf("left(description, %d)", query.TruncationLength),
			"user_id", "users.net_id", "saved_search_id", "notify_enabled", "status").
		From("seeks").
		Where("seeks.is_active=true").
		LeftJoin("users ON seeks.user_id = users.key_id")

	for _, word := range strings.Fields(query.Query) {
		stmt = stmt.Where("(lower(seeks.title) LIKE lower(?) OR lower(seeks.description) LIKE lower(?))", fmt.Sprint("%", word, "%"), fmt.Sprint("%", word, "%"))
	}

	if query.UserID == 0 && query.OnlyMine {
		return nil, errors.New("Unauthenticated user attempted to view profile data"), http.StatusUnauthorized
	}

	if query.OnlyMine {
		stmt = stmt.Where(sq.Eq{"user_id": query.UserID})
	}

	stmt = stmt.OrderBy("seeks.creation_date DESC")

	if query.Limit <= maxNumResults {
		stmt = stmt.Limit(query.Limit)
	} else {
		stmt = stmt.Limit(maxNumResults)
	}

	stmt = stmt.Offset(query.Offset)

	// Query db
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return nil, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate seek structs
	seeks := make([]*Seek, 0)
	for rows.Next() {
		s := new(Seek)
		err := rows.Scan(&s.KeyID, &s.CreationDate, &s.LastModificationDate,
			&s.Title, &s.Description, &s.UserID, &s.Username, &s.SavedSearchID,
			&s.NotifyEnabled, &s.Status)
		if err != nil {
			return nil, err, http.StatusInternalServerError
		}
		seeks = append(seeks, s)
	}
	if err = rows.Err(); err != nil {
		return nil, err, http.StatusInternalServerError
	}

	return seeks, nil, http.StatusOK
}

// Returns the most recent count seeks, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func ReadSeek(db *sql.DB, id string) (Seek, error, int) {
	var seek Seek

	// Create seek query
	query := psql.
		Select("seeks.key_id", "seeks.creation_date",
			"seeks.last_modification_date", "title", "description", "user_id",
			"users.net_id", "saved_search_id", "notify_enabled", "status").
		From("seeks").
		Where("seeks.is_active=true").
		LeftJoin("users ON seeks.user_id = users.key_id").
		Where(sq.Eq{"seeks.key_id": id})

	// Query db for seek
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return seek, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate seek struct
	rows.Next()
	err = rows.Scan(&seek.KeyID, &seek.CreationDate, &seek.LastModificationDate,
		&seek.Title, &seek.Description, &seek.UserID, &seek.Username, &seek.SavedSearchID,
		&seek.NotifyEnabled, &seek.Status)
	if err == sql.ErrNoRows {
		return seek, err, http.StatusNotFound
	} else if err != nil {
		return seek, err, http.StatusInternalServerError
	}

	return seek, nil, http.StatusOK
}

// Inserts the given seek (belonging to userId) into the database. Returns
// seek with its new KeyID added.
func CreateSeek(db *sql.DB, seek Seek, userId int) (Seek, error, int) {
	seek.UserID = userId

	// Insert seek
	stmt := psql.Insert("seeks").
		Columns("title", "description", "user_id", "saved_search_id",
			"notify_enabled", "status").
		Values(seek.Title, seek.Description, userId, seek.SavedSearchID,
			seek.NotifyEnabled, seek.Status).
		Suffix("RETURNING key_id, creation_date")

	// Query db for seek
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return seek, err, http.StatusInternalServerError
	}
	defer rows.Close()

	// Populate seek struct
	rows.Next()
	err = rows.Scan(&seek.KeyID, &seek.CreationDate)
	if err != nil {
		return seek, err, http.StatusInternalServerError
	}

	return seek, nil, http.StatusCreated
}

// Overwrites the seek in the database with the given id with the given seek
// (belonging to userId). Returns the updated seek.
func UpdateSeek(db *sql.DB, id string, seek Seek, userId int) (error, int) {
	seek.UserID = userId

	// Update seek
	stmt := psql.Update("seeks").
		SetMap(map[string]interface{}{
			"title":           seek.Title,
			"description":     seek.Description,
			"saved_search_id": seek.SavedSearchID,
			"notify_enabled":  seek.NotifyEnabled}).
		Where(sq.Eq{"seeks.key_id": id,
			"seeks.user_id": userId})

	// Query db for seek
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// Deletes the seek in the database with the given id with the given seek
// (belonging to userId).
func DeleteSeek(db *sql.DB, id string, userId int) (error, int) {
	// Update seek
	stmt := psql.Delete("seeks").
		Where(sq.Eq{"seeks.key_id": id,
			"seeks.user_id": userId})

	// Query db for seek
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}
