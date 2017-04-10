package server

import (
	"encoding/json"
	"github.com/julienschmidt/httprouter"
	"strings"
	"log"
	"fmt"
	"net/http"
)

// Searches database for all occurrences of every space-separated word in query
func Search(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if r.Method != "GET" {
		http.Error(w, http.StatusText(405), 405)
		return
	}

	listings := make([]*ListingsItem, 0)

	for _, word := range strings.Split(ps.ByName("query"), " ") {
		// Query db
		rows, err := db.Query("SELECT DISTINCT listings.key_id, listings.creation_date, " +
			"listings.last_modification_date, title, description, " +
			"user_id, price, status, expiration_date, " +
			"thumbnails.url FROM listings LEFT OUTER JOIN " +
			"thumbnails ON listings.thumbnail_id = " +
			"thumbnails.key_id WHERE listings.title LIKE '%' || $1 || '%' " +
			"OR listings.description LIKE '%' || $1 || '%' LIMIT 30;", word)
		if err != nil {
			log.Print(err)
			http.Error(w, http.StatusText(500), 500)
			return
		}
		defer rows.Close()

		// Populate listing structs
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
