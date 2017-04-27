package models

import (
	"database/sql"
	"net/http"
	"errors"
)


func wasSuccessfulUpdate(result sql.Result, err error) (bool, error, int) {

	if err != nil {
		return false, err, http.StatusInternalServerError
	}
	numRows, err := result.RowsAffected()
	if err != nil {
		return false, err, http.StatusInternalServerError
	}
	if numRows == 0 {
		return false, sql.ErrNoRows, http.StatusNotFound
	}
	if numRows != 1 {
		return false, errors.New("Multiple rows affected!"), http.StatusInternalServerError
	}

	return true, nil, http.StatusOK
}
