package models

import (
	"database/sql"
	"errors"
	"net/http"
)

// Default maximum number of characters in a truncated description of a datum
// Used when obtaining and displaying many datum of a given structure
const defaultTruncationLength = 1024

// Default and maximum number of datum returned by bulk API queries
// Used when obtaining and displaying many datum of a given structure
const defaultNumResults uint64 = 30

func getUpdateResultCode(result sql.Result, err error) (error, int) {

	if err != nil {
		return err, http.StatusInternalServerError
	}
	numRows, err := result.RowsAffected()
	if err != nil {
		return err, http.StatusInternalServerError
	}
	if numRows == 0 {
		return sql.ErrNoRows, http.StatusNotFound
	}
	if numRows != 1 {
		return errors.New("Multiple rows affected!"), http.StatusInternalServerError
	}

	return nil, http.StatusNoContent
}
