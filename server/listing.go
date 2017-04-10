package server

import (
	"encoding/json"
	"github.com/julienschmidt/httprouter"
	"github.com/guregu/null"
	"log"
	"fmt"
	"net/http"
)

var maxDescriptionSize = 1024

// This is the "JSON" struct that appears in the array returned by getRecentListings
type ListingsItem struct {
	KeyID int `json:"keyId"`
	CreationDate null.Time `json:"creationDate"`
	LastModificationDate null.Time `json:"lastModificationDate"`
	Title string `json:"title"`
	Description null.String `json:"description"`
	UserID int `json:"userId"`
	Price null.Int `json:"price"`
	Status null.String `json:"status"`
	ExpirationDate null.Time `json:"expirationDate"`
	Thumbnail null.String `json:"thumbnail"`
}

// Returns the most recent count listings, based on original date created.
func GetRecentListings(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}
	// Query db
	rows, err := db.Query("SELECT listings.key_id, listings.creation_date, " +
		"listings.last_modification_date, title, left(description, $1), " +
		"user_id, price, status, expiration_date, " +
		"thumbnails.url " +
		"FROM listings LEFT OUTER JOIN thumbnails " +
		"ON listings.thumbnail_id = thumbnails.key_id " +
		"ORDER BY listings.creation_date DESC " +
		"LIMIT 30;", maxDescriptionSize)
	if err != nil {
		log.Print(err)
		http.Error(w, http.StatusText(500), 500)
		return
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
			log.Print(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}
		listings = append(listings, l)
		if err = rows.Err(); err != nil {
			log.Print(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}
	}

	// Convert listings to JSON, Return to client
	l, err := json.Marshal(listings)
	if err != nil {
		log.Print(err)
		http.Error(w, http.StatusText(500), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json;charset=utf-8")
	fmt.Fprint(w, string(l))
}
