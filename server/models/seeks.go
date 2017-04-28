package models

import (
	"database/sql"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	"github.com/guregu/null"
	"net/http"
	"strings"
)

// This is the "JSON" struct that appears in the array returned by getRecentSeeks
type SeeksItem struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	LastModificationDate null.Time   `json:"lastModificationDate"`
	Title                string      `json:"title"`
	Description          null.String `json:"description"` // expect to be truncated
	UserID               int         `json:"userId"`
	SavedSearchID        null.Int    `json:"savedSearchId"`
	NotifyEnabled        null.Bool   `json:"notifyEnabled"`
	Status               null.String `json:"status"`
}

// TODO Maybe use the same struct for both of these? The only difference is truncation of the descrip
// Returned by a function returning only one seek (usually by ID)
type Seek struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	LastModificationDate null.Time   `json:"lastModificationDate"`
	Title                string      `json:"title"`
	Description          null.String `json:"description"`
	UserID               int         `json:"userId"`
	SavedSearchID        null.Int    `json:"savedSearchId"`
	NotifyEnabled        null.Bool   `json:"notifyEnabled"`
	Status               null.String `json:"status"`
}

type seekQuery struct {
	Query            string
	TruncationLength int
	Limit            uint64
}

func NewSeekQuery() *seekQuery {
	q := new(seekQuery)
	q.TruncationLength = defaultTruncationLength
	q.Limit = defaultNumResults
	return q
}

// Returns the most recent count seeks, based on original date created.
// If queryStr is nonempty, filters that every returned item must have every word in either title or description
// On error, returns an error and the HTTP code associated with that error.
func ReadSeeks(db *sql.DB, query *seekQuery) ([]*SeeksItem, error, int) {
	// Create seeks statement
	stmt := psql.
		Select("seeks.key_id", "seeks.creation_date", "seeks.last_modification_date",
			"title", fmt.Sprintf("left(description, %d)", query.TruncationLength),
			"user_id", "saved_search_id", "notify_enabled", "status").
		From("seeks").
		Where("seeks.is_active=true")

	for i, word := range strings.Fields(query.Query) {
		stmt = stmt.Where(fmt.Sprintf("(lower(seeks.title) LIKE lower($%d) OR lower(seeks.description) LIKE lower($%d))", i+1, i+1), fmt.Sprint("%", word, "%"))
	}

	stmt = stmt.OrderBy("seeks.creation_date DESC")

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

	// Populate seek structs
	seeks := make([]*SeeksItem, 0)
	for rows.Next() {
		l := new(SeeksItem)
		err := rows.Scan(&l.KeyID, &l.CreationDate, &l.LastModificationDate,
			&l.Title, &l.Description, &l.UserID, &l.SavedSearchID,
			&l.NotifyEnabled, &l.Status)
		if err != nil {
			return nil, err, http.StatusInternalServerError
		}
		seeks = append(seeks, l)
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
			"saved_search_id", "notify_enabled", "status").
		From("seeks").
		Where("seeks.is_active=true").
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
		&seek.Title, &seek.Description, &seek.UserID, &seek.SavedSearchID,
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

	return seek, nil, http.StatusOK
}

// Overwrites the seek in the database with the given id with the given seek
// (belonging to userId). Returns the updated seek.
func UpdateSeek(db *sql.DB, id string, seek Seek, userId int) (Seek, error, int) {
	seek.UserID = userId

	// Update seek
	stmt := psql.Update("seeks").
		SetMap(map[string]interface{}{
			"title":           seek.Title,
			"description":     seek.Description,
			"user_id":         userId,
			"saved_search_id": seek.SavedSearchID,
			"notify_enabled":  seek.NotifyEnabled}).
		Where(sq.Eq{"seeks.key_id": id,
			"seeks.user_id": userId})

	// Query db for seek
	result, err := stmt.RunWith(db).Exec()
	code, err := getUpdateResultCode(result, err)

	if err != nil {
		return seek, err, code
	}

	return ReadSeek(db, id)
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
	code, err := getUpdateResultCode(result, err)

	return err, code
}
