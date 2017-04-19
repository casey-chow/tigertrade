package models

import (
	"database/sql"
	"fmt"
	sq "github.com/Masterminds/squirrel"
	"github.com/guregu/null"
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
// Returned by a getById function
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

// Returns the most recent count seeks, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func GetRecentSeeks(db *sql.DB, maxDescriptionSize int, limit uint64) ([]*SeeksItem, error, int) {
	// Create seeks query
	query := psql.
		Select("seeks.key_id", "seeks.creation_date", "seeks.last_modification_date",
			"title", fmt.Sprintf("left(description, %d)", maxDescriptionSize),
			"user_id", "saved_search_id", "notify_enabled", "status").
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

// Returns the most recent count seeks, based on original date created. On error
// returns an error and the HTTP code associated with that error.
func GetSeekById(db *sql.DB, id string) (Seek, error, int) {
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
		return seek, err, 500
	}
	defer rows.Close()

	// Populate seek struct
	rows.Next()
	err = rows.Scan(&seek.KeyID, &seek.CreationDate, &seek.LastModificationDate,
		&seek.Title, &seek.Description, &seek.UserID, &seek.SavedSearchID,
		&seek.NotifyEnabled, &seek.Status)
	if err != nil {
		return seek, err, 500
	}

	return seek, nil, 0
}

// Inserts the given seek (belonging to userId) into the database. Returns
// seek with its new KeyID added.
func AddSeek(db *sql.DB, seek Seek, userId int) (Seek, error, int) {
	seek.UserID = userId

	// Insert seek
	stmt := psql.Insert("seeks").
		Columns("title", "description", "user_id", "saved_search_id", "notify_enabled", "status").
		Values(seek.Title, seek.Description, userId, seek.SavedSearchID, seek.NotifyEnabled, seek.Status).
		Suffix("RETURNING key_id, creation_date")

	// Query db for seek
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return seek, err, 500
	}
	defer rows.Close()

	// Populate seek struct
	rows.Next()
	err = rows.Scan(&seek.KeyID, &seek.CreationDate)
	if err != nil {
		return seek, err, 500
	}

	return seek, nil, 0
}
