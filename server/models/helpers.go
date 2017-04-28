package models

import (
	"database/sql"
	"errors"
	"net/http"
)

// Maximum number of characters in a truncated description of a datum
// Used when obtaining and displaying many datum of a given structure
const truncationLength = 1024

// Default and maximum number of datum returned by bulk API queries
// Used when obtaining and displaying many datum of a given structure
const defaultNumResults uint64 = 30
const maxNumResults uint64 = 100

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
		return http.StatusInternalServerError, errors.New("Multiple rows affected!")
	}

	return http.StatusOK, nil
}
