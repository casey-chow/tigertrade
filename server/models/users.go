package models

import (
	"database/sql"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/guregu/null"
)

// A User is a record type storing a row of the users table
type User struct {
	KeyID                int       `json:"keyId"`
	CreationDate         null.Time `json:"creationDate"`
	LastModificationDate null.Time `json:"lastModificationDate"`
	NetID                string    `json:"netId"`
}

// GetOrCreateUser makes sure the netID exists in the db, creating it if it doesn't already.
// Security Note: DO NOT allow user-generated data into this function. This assumes the netID is from CAS.
func GetOrCreateUser(db *sql.DB, netID string) (*User, error) {
	user, err := GetUser(db, netID)
	if err == nil {
		return user, nil
	}
	if err != sql.ErrNoRows {
		log.WithFields(log.Fields{
			"err":   err,
			"netID": netID,
		}).Error("error while getting user")
		return nil, err
	}

	log.WithField("netID", netID).
		Print("creating user")
	insert := psql.Insert("users").
		Columns("net_id").
		Values(netID)

	_, err = insert.RunWith(db).Exec()
	if err != nil {
		return nil, err
	}

	return GetUser(db, netID)
}

// GetUser gets the specified user. If user does not exist, returns an error.
func GetUser(db *sql.DB, netID string) (*User, error) {
	query := psql.
		Select("key_id", "net_id", "creation_date", "last_modification_date").
		From("users").
		Where(sq.Eq{"net_id": netID}).
		Limit(1)

	user := new(User)
	err := query.RunWith(db).
		QueryRow().
		Scan(
			&user.KeyID,
			&user.NetID,
			&user.CreationDate,
			&user.LastModificationDate,
		)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByID gets the specified user. If user does not exist, returns an error.
func GetUserByID(db *sql.DB, id int) (*User, error) {
	query := psql.
		Select("key_id", "net_id", "creation_date", "last_modification_date").
		From("users").
		Where(sq.Eq{"key_id": id}).
		Limit(1)

	user := new(User)
	err := query.RunWith(db).
		QueryRow().
		Scan(
			&user.KeyID,
			&user.NetID,
			&user.CreationDate,
			&user.LastModificationDate,
		)
	if err != nil {
		return nil, err
	}

	return user, nil
}
