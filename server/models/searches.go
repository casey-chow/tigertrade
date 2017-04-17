package models

import (
	"database/sql"
	"fmt"
	"strings"
)

// Searches database for all occurrences of every space-separated word in query
func GetSearch(db *sql.DB, queryStr string, maxDescriptionSize int, limit uint64) ([]*ListingsItem, error, int) {
	// Create search query
	query := psql.
		Select("listings.key_id", "listings.creation_date", "listings.last_modification_date",
			"title", fmt.Sprintf("left(description, %d)", maxDescriptionSize),
			"user_id", "price", "status", "expiration_date", "thumbnails.url").
		Distinct().
		From("listings").
		LeftJoin("thumbnails ON listings.thumbnail_id = thumbnails.key_id")

	for i, word := range strings.Fields(queryStr) {
		query = query.Where(fmt.Sprintf("(lower(listings.title) LIKE lower($%d) OR lower(listings.description) LIKE lower($%d))", i+1, i+1), fmt.Sprint("%", word, "%"))
	}

	query = query.Limit(limit)

	// Query dbish shsell
	rows, err := query.RunWith(db).Query()
	if err != nil {
		return nil, err, 500
	}
	defer rows.Close()

	// Populate listing structs
	listings := make([]*ListingsItem, 0)
	for rows.Next() {
		l := new(ListingsItem)
		err := rows.Scan(&l.KeyID, &l.CreationDate, &l.LastModificationDate,
			&l.Title, &l.Description, &l.UserID, &l.Price, &l.Status,
			&l.ExpirationDate, &l.Thumbnail)
		if err != nil {
			return nil, err, 500
		}
		listings = append(listings, l)
	}
	if err = rows.Err(); err != nil {
		return nil, err, 500
	}

	return listings, nil, 0
}
