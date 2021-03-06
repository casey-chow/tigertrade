package models

import (
	"database/sql"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/bbalet/stopwords"
	"github.com/casey-chow/wnram"
	"github.com/getsentry/raven-go"
	"github.com/lib/pq"
	"github.com/mozillazg/go-unidecode"
	"strings"
	"time"
)

var wn *wnram.Handle

func indexListing(db *sql.DB, listing Listing) {
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

func whereFuzzyOrSemanticMatch(stmt sq.SelectBuilder, query string) sq.SelectBuilder {
	if query == "" {
		return stmt
	}

	semantic := semanticMatch(query)
	fuzzy := fuzzyMatch(query)

	queries := sq.Or{semantic, fuzzy}
	queriesSQL, args, _ := queries.ToSql()
	return stmt.Where(queriesSQL, args...)
}

func semanticMatch(query string) sq.Sqlizer {
	words := tokenize(query)
	if len(words) == 0 {
		return new(emptyQuery)
	}

	wordsJoined := strings.Join(words, " ")

	// && -> the postgres array intersection operator
	// returns true when the two arrays intersect
	return sq.Expr("string_to_array(?, ' ') && keywords", wordsJoined)
}

func fuzzyMatch(query string) sq.Sqlizer {
	cleaned := strings.ToLower(query)
	words := strings.Fields(cleaned)
	if len(words) == 0 {
		return new(emptyQuery)
	}

	queries := make(sq.Or, 0, 2*len(words)) // two queries per word

	for _, word := range words {
		titleMatch := sq.Expr(
			"lower(title) LIKE ?",
			"%"+word+"%",
		)
		descMatch := sq.Expr(
			"lower(description) LIKE ?",
			"%"+word+"%",
		)
		queries = append(queries, titleMatch, descMatch)
	}

	return queries
}

// Unidecode, remove stopwords, and lowercase string for analysis.
func tokenize(str string) []string {
	decoded := unidecode.Unidecode(str)
	cleaned := stopwords.CleanString(decoded, "en", true)
	lowered := strings.ToLower(cleaned)
	return stringUnique(strings.Fields(lowered))
}

func wordsForCorpus(corpus string) []string {
	words := tokenize(corpus)

	for _, word := range words {
		synonyms, err := synonymsFor(word)
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

func synonymsFor(word string) ([]string, error) {
	lookups, err := wn.Lookup(wnram.Criteria{Matching: word})
	if err != nil {
		return nil, err
	}

	synonyms := make([]string, 0, len(lookups)*3)
	for _, lookup := range lookups {
		syns := lookup.Synonyms()
		synonyms = append(synonyms, syns...)
	}

	return synonyms, nil
}

func init() {
	var err error
	wn, err = wnram.New()
	if err != nil {
		log.WithError(err).Fatal("error while initializing wordnet")
	}
}
