package models

import (
	"database/sql"
	sq "github.com/Masterminds/squirrel"
	"github.com/Obaied/RAKE.Go"
	log "github.com/Sirupsen/logrus"
	"github.com/bbalet/stopwords"
	"github.com/getsentry/raven-go"
	"github.com/karan/vocabulary"
	"github.com/lib/pq"
	"github.com/mozillazg/go-unidecode"
	"strings"
	"time"
)

var vocab vocabulary.Vocabulary

func IndexListing(db *sql.DB, listing Listing) {
	log.WithField("keyID", listing.KeyID).Info("indexing listing")
	start := time.Now()
	defer logTime(start, "IndexListing")

	description, _ := listing.Description.MarshalText()
	corpus := strings.Join([]string{
		listing.Title,
		string(description),
	}, " ")

	keywords := wordsForCorpus(corpus)

	stmt := psql.Update("listings").
		Set("keywords", pq.StringArray(keywords)).
		Where(sq.Eq{
			"listings.key_id":  listing.KeyID,
			"listings.user_id": listing.UserID,
		})

	_, err := stmt.RunWith(db).Exec()
	if err != nil {
		raven.CaptureError(err, nil)
		log.WithError(err).
			WithField("listing_id", listing.KeyID).
			Error("error while indexing listing")
		return
	}
}

// Unidecode, remove stopwords, and lowercase string for analysis.
func normalize(str string) string {
	decoded := unidecode.Unidecode(str)
	cleaned := stopwords.CleanString(decoded, "en", true)
	lowered := strings.ToLower(cleaned)

	return lowered
}

func wordsForCorpus(corpus string) []string {
	normalized := normalize(corpus)
	words := stringUnique(rake.SeperateWords(normalized))

	for _, word := range words {
		synonyms, err := vocab.Synonyms(word)
		if err != nil {
			log.WithError(err).
				Warning("error while retrieving synonyms")
			continue
		}

		// only add one-word synonyms
		for _, synonym := range synonyms {
			if strings.Index(synonym, " ") == -1 {
				words = append(words, synonym)
			}
		}
	}

	return stringUnique(words)
}

func init() {
	var err error
	vocab, err = vocabulary.New(&vocabulary.Config{})
	if err != nil {
		log.WithError(err).Fatal("error while initializing vocabulary")
	}
}
