package models

import (
	"database/sql"
	"errors"
	sq "github.com/Masterminds/squirrel"
	"github.com/guregu/null"
	"net/http"
)

// A Seek is a record type storing a row of the seeks table
type Seek struct {
	KeyID                int         `json:"keyId"`
	CreationDate         null.Time   `json:"creationDate"`
	LastModificationDate null.Time   `json:"lastModificationDate"`
	Title                string      `json:"title"`
	Description          null.String `json:"description"`
	UserID               int         `json:"userId"`
	Username             null.String `json:"username"`
	SavedSearchID        null.Int    `json:"watchId"`
	NotifyEnabled        null.Bool   `json:"notifyEnabled"`
	Status               null.String `json:"status"`
}

// GetCreationDate returns the CreationDate of the Seek
func (s Seek) GetCreationDate() null.Time {
	return s.CreationDate
}

// GetLastModificationDate returns the LastModificationDate of the Seek
func (s Seek) GetLastModificationDate() null.Time {
	return s.LastModificationDate
}

// GetTitle returns the Title of the Seek
func (s Seek) GetTitle() string {
	return s.Title
}

// GetDescription returns the Description of the Seek
func (s Seek) GetDescription() null.String {
	return s.Description
}

// GetUserID returns the UserID of the Seek
func (s Seek) GetUserID() int {
	return s.UserID
}

// GetUsername returns the Username of the Seek
func (s Seek) GetUsername() null.String {
	return s.Username
}

// GetStatus returns the Status of the Seek
func (s Seek) GetStatus() null.String {
	return s.Status
}

// A SeekQuery contains the necessary parameters for a parametrized query of the seeks table
type SeekQuery struct {
	Query    string
	OnlyMine bool
	Limit    uint64 // maximum number of listings to return
	Offset   uint64 // offset in search results to send
	UserID   int
}

// NewSeekQuery creates a SeekQuery with the appropriate default values
func NewSeekQuery() *SeekQuery {
	q := new(SeekQuery)
	q.Limit = defaultNumResults
	return q
}

// ReadSeeks performs a customizable request for a collection of seeks, as specified by a SeekQuery
func ReadSeeks(db *sql.DB, query *SeekQuery) ([]*Seek, int, error) {
	if query.UserID == 0 && query.OnlyMine {
		return nil, http.StatusUnauthorized, errors.New("unauthenticated user attempted to view profile data")
	}

	// Query db
	stmt := buildSeekQuery(query)
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	defer rows.Close()

	// Populate seek structs
	seeks := make([]*Seek, 0)
	for rows.Next() {
		s := new(Seek)
		err := rows.Scan(
			&s.KeyID,
			&s.CreationDate,
			&s.LastModificationDate,
			&s.Title,
			&s.Description,
			&s.UserID,
			&s.Username,
			&s.SavedSearchID,
			&s.NotifyEnabled,
			&s.Status,
		)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}
		seeks = append(seeks, s)
	}
	if err = rows.Err(); err != nil {
		return nil, http.StatusInternalServerError, err
	}

	return seeks, http.StatusOK, nil
}

func buildSeekQuery(query *SeekQuery) sq.SelectBuilder {
	stmt := psql.
		Select(
			"seeks.key_id",
			"seeks.creation_date",
			"seeks.last_modification_date",
			"title",
			"description",
			"user_id",
			"users.net_id",
			"saved_search_id",
			"notify_enabled",
			"status",
		).
		From("seeks").
		Where("seeks.is_active=true").
		LeftJoin("users ON seeks.user_id = users.key_id")

	stmt = whereFuzzyOrSemanticMatch(stmt, query.Query)

	if query.OnlyMine {
		stmt = stmt.Where(sq.Eq{"user_id": query.UserID})
	}

	stmt = stmt.OrderBy("seeks.creation_date DESC")
	if query.Limit > defaultNumResults {
		stmt = stmt.Limit(query.Limit)
	} else {
		stmt = stmt.Limit(defaultNumResults)
	}
	stmt = stmt.Offset(query.Offset)

	return stmt
}

// ReadSeek returns the seek with the given ID
func ReadSeek(db *sql.DB, id string) (Seek, int, error) {
	var seek Seek

	// Create seek query
	query := psql.
		Select(
			"seeks.key_id",
			"seeks.creation_date",
			"seeks.last_modification_date",
			"title",
			"description",
			"user_id",
			"users.net_id",
			"saved_search_id",
			"notify_enabled",
			"status",
		).
		From("seeks").
		Where("seeks.is_active=true").
		LeftJoin("users ON seeks.user_id = users.key_id").
		Where(sq.Eq{"seeks.key_id": id})

	// Query db for seek
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return seek, http.StatusInternalServerError, err
	}
	defer rows.Close()

	// Populate seek struct
	rows.Next()
	err = rows.Scan(&seek.KeyID, &seek.CreationDate, &seek.LastModificationDate,
		&seek.Title, &seek.Description, &seek.UserID, &seek.Username, &seek.SavedSearchID,
		&seek.NotifyEnabled, &seek.Status)
	if err == sql.ErrNoRows {
		return seek, http.StatusNotFound, err
	} else if err != nil {
		return seek, http.StatusInternalServerError, err
	}

	return seek, http.StatusOK, nil
}

// CreateSeek inserts the given seek (belonging to userID) into the database.
// Returns the seek with its new KeyID added
func CreateSeek(db *sql.DB, seek Seek, userID int) (Seek, int, error) {
	seek.UserID = userID

	// Insert seek
	stmt := psql.Insert("seeks").
		Columns(
			"title",
			"description",
			"user_id",
			"saved_search_id",
			"notify_enabled",
			"status",
		).
		Values(
			seek.Title,
			seek.Description,
			userID,
			seek.SavedSearchID,
			seek.NotifyEnabled,
			seek.Status,
		).
		Suffix("RETURNING key_id, creation_date")

	// Query db for seek
	rows, err := stmt.RunWith(db).Query()
	if err != nil {
		return seek, http.StatusInternalServerError, err
	}
	defer rows.Close()

	// Populate seek struct
	rows.Next()
	err = rows.Scan(
		&seek.KeyID,
		&seek.CreationDate,
	)
	if err != nil {
		return seek, http.StatusInternalServerError, err
	}

	return seek, http.StatusCreated, nil
}

// UpdateSeek overwrites the seek in the database with the given id with the given seek
func UpdateSeek(db *sql.DB, id string, seek Seek, userID int) (int, error) {
	seek.UserID = userID

	// Update seek
	stmt := psql.Update("seeks").
		SetMap(map[string]interface{}{
			"title":           seek.Title,
			"description":     seek.Description,
			"saved_search_id": seek.SavedSearchID,
			"notify_enabled":  seek.NotifyEnabled,
		}).
		Where(sq.Eq{
			"seeks.key_id":  id,
			"seeks.user_id": userID,
		})

	// Query db for seek
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}

// DeleteSeek deletes the seek in the database with the given id
func DeleteSeek(db *sql.DB, id string, userID int) (int, error) {
	// Update seek
	stmt := psql.Delete("seeks").
		Where(sq.Eq{
			"seeks.key_id":  id,
			"seeks.user_id": userID,
		})

	// Query db for seek
	result, err := stmt.RunWith(db).Exec()
	return getUpdateResultCode(result, err)
}
