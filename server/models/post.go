package models

import (
	"database/sql"
	"github.com/guregu/null"
)

// A Post is made by a User and contains
type Post interface {
	GetCreationDate() null.Time
	GetLastModificationDate() null.Time
	GetTitle() string
	GetDescription() null.String
	GetUserID() int
	GetUsername() null.String
	GetStatus() null.String
	GetIsActive() bool
}

// A PostReader is a function which queries the appropriate table for the post with the given ID
type PostReader (func(*sql.DB, string) (Post, int, error))

// ReadListingAsPost is a PostReader for Listings
func ReadListingAsPost(db *sql.DB, id string) (Post, int, error) {
	return ReadListing(db, id, 0)
}

// ReadSeekAsPost is a PostReader for Seek
func ReadSeekAsPost(db *sql.DB, id string) (Post, int, error) {
	return ReadSeek(db, id)
}
