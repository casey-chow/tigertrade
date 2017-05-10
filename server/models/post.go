package models

import (
	"database/sql"
	"github.com/guregu/null"
)

// A Post is made by a User and contains 
type Post interface {
	GetCreationDate()         null.Time
	GetLastModificationDate() null.Time
	GetTitle()                string
	GetDescription()          null.String
	GetUserID()               int
	GetUsername()             null.String
	GetStatus()               null.String
}

type PostReader (func(*sql.DB, string) (Post, int, error))

func ReadListingAsPost(db *sql.DB, id string) (Post, int, error) {
	return ReadListing(db, id)
}

func ReadSeekAsPost(db *sql.DB, id string) (Post, int, error) {
	return ReadSeek(db, id)
}