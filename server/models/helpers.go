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

// Default and maximum number of datum returned by bulk API queries
// Used when obtaining and displaying many datum of a given structure
const defaultNumResults uint64 = 30

type emptyQuery struct{}

func (_ emptyQuery) ToSql() (string, []interface{}, error) {
	return "", nil, nil
}

// getExecResultCode is a standard way to extract an HTTP error out of an SQL result
func getExecResultCode(result sql.Result, err error) (int, error) {
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

// getExecDoNothingResultCode is like getExecResultCode,
// but should be used when the SQL operation affecting no rows is not an error
func getExecDoNothingResultCode(result sql.Result, err error) (int, error) {
	code, err := getExecResultCode(result, err)
	if code == http.StatusNotFound {
		return http.StatusNoContent, nil
	}
	return code, err
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
