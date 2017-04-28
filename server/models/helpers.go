package models

import (
	"database/sql"
	"errors"
	"net/http"
)

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
