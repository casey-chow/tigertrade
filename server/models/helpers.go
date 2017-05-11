package models

import (
	"database/sql"
	"errors"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"net/http"
	"time"
)

// PostgreSQL Statement Builder instance
var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

// Default maximum number of characters in a truncated description of a datum
// Used when obtaining and displaying many datum of a given structure
const defaultTruncationLength = 1024

// Default and maximum number of datum returned by bulk API queries
// Used when obtaining and displaying many datum of a given structure
const defaultNumResults uint64 = 30

func getUpdateResultCode(result sql.Result, err error) (int, error) {

	if err != nil {
		return http.StatusInternalServerError, err
	}
	numRows, err := result.RowsAffected()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	if numRows == 0 {
		return http.StatusNotFound, sql.ErrNoRows
	}
	if numRows != 1 {
		return http.StatusInternalServerError, errors.New("multiple rows affected")
	}

	return http.StatusNoContent, nil
}

// https://coderwall.com/p/cp5fya/measuring-execution-time-in-go
func logTime(start time.Time, name string) {
	elapsed := time.Since(start)
	log.WithField("took", elapsed).
		Infof("completed execution of %s", name)
}

// https://goo.gl/BPVkA6
func stringUnique(s []string) []string {
	seen := make(map[string]struct{}, len(s))
	j := 0
	for _, v := range s {
		if _, ok := seen[v]; ok {
			continue
		}
		seen[v] = struct{}{}
		s[j] = v
		j++
	}
	return s[:j]
}
