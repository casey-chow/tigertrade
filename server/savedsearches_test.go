package server

import (
	. "github.com/smartystreets/goconvey/convey"
	"gopkg.in/DATA-DOG/go-sqlmock.v1"
	"net/http"
	"strings"
	"testing"
	"time"
)

func TestReadSavedSearches(t *testing.T) {
	app := App()

	Convey("when showing all saved searches", t, func() {
		oldDb := db
		oldGetusername := getUsername
		defer func() {
			getUsername = oldGetusername
			db.Close()
			db = oldDb
		}()

		var mock sqlmock.Sqlmock
		var err error
		db, mock, err = sqlmock.New()
		if err != nil {
			t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
		}

		Convey("rejects if the user is not logged in", func() {
			getUsername = func(_ *http.Request) string { return "" }
			req, _ := http.NewRequest("GET", "/api/watches/140", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnauthorized)
		})

		Convey("should return a list of saved searches", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }
			mock.ExpectQuery("SELECT .* FROM users WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id", "net_id", "creation_date", "last_modification_date",
				}).AddRow(1, "testuser", time.Now(), time.Now()))
			mock.ExpectQuery("SELECT .* FROM saved_searches WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"saved_searches.key_id",
					"saved_searches.creation_date",
					"saved_searches.last_modification_date",
					"query",
					"min_price",
					"max_price",
					"listing_expiration_date",
					"search_expiration_date",
					"is_active",
				}).AddRow(
					140,
					time.Now(),
					time.Now(),
					"SampleValue",
					0,
					1,
					time.Now(),
					time.Now(),
					true,
				))

			req, _ := http.NewRequest("GET", "/api/watches", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res, shouldHaveContentType, "application/json")
			So(res.Body.String(), shouldBeJSON)
		})

	})

}

func TestReadSavedSearch(t *testing.T) {
	app := App()

	Convey("when reading a saved search", t, func() {
		oldDb := db
		oldGetusername := getUsername
		defer func() {
			getUsername = oldGetusername
			db.Close()
			db = oldDb
		}()

		var mock sqlmock.Sqlmock
		var err error
		db, mock, err = sqlmock.New()
		if err != nil {
			t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
		}

		Convey("rejects if the user is not logged in", func() {
			getUsername = func(_ *http.Request) string { return "" }
			req, _ := http.NewRequest("GET", "/api/watches/140", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnauthorized)
		})

		Convey("returns valid JSON", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }
			mock.ExpectQuery("SELECT .* FROM users WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id", "net_id", "creation_date", "last_modification_date",
				}).AddRow(1, "testuser", time.Now(), time.Now()))
			mock.ExpectQuery("SELECT .* FROM saved_searches WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"saved_searches.key_id",
					"saved_searches.creation_date",
					"saved_searches.last_modification_date",
					"query",
					"min_price",
					"max_price",
					"listing_expiration_date",
					"search_expiration_date",
					"is_active",
				}).AddRow(
					140,
					time.Now(),
					time.Now(),
					"SampleValue",
					0,
					1,
					time.Now(),
					time.Now(),
					true,
				))
			req, _ := http.NewRequest("GET", "/api/watches/140", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res, shouldHaveContentType, "application/json")
			So(res.Body.String(), shouldBeJSON)

			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

		Convey("gets the saved search with the proper id", nil)

	})

}

func TestCreateSavedSearch(t *testing.T) {
	app := App()

	Convey("when creating a saved search", t, func() {
		oldDb := db
		oldGetUsername := getUsername
		defer func() {
			getUsername = oldGetUsername
			db.Close()
			db = oldDb
		}()

		var mock sqlmock.Sqlmock
		var err error
		db, mock, err = sqlmock.New()
		if err != nil {
			t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
		}

		Convey("rejects the saved search without valid json", func() {
			body := strings.NewReader("{\\}")
			req, _ := http.NewRequest("POST", "/api/watches", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnprocessableEntity)
		})

		Convey("rejects the saved search without a user", func() {
			body := strings.NewReader("{}")
			req, _ := http.NewRequest("POST", "/api/watches", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnauthorized)
		})

		Convey("attempts saved search creation given a valid user", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }
			mock.ExpectQuery("SELECT .* FROM users WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id", "net_id", "creation_date", "last_modification_date",
				}).AddRow(1, "testuser", time.Now(), time.Now()))
			mock.ExpectQuery("INSERT INTO saved_searches .* VALUES .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id",
					"creation_date",
				}).AddRow(1, time.Now()))

			body := strings.NewReader("{}")
			req, _ := http.NewRequest("POST", "/api/watches", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusCreated)
			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})
	})
}

func TestUpdateSavedSearch(t *testing.T) {
	app := App()

	Convey("when updating a savedsearch", t, func() {
		oldDb := db
		oldGetUsername := getUsername
		defer func() {
			getUsername = oldGetUsername
			db.Close()
			db = oldDb
		}()

		var mock sqlmock.Sqlmock
		var err error
		db, mock, err = sqlmock.New()
		if err != nil {
			t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
		}

		Convey("rejects the update without a valid id", func() {
			body := strings.NewReader("{\\}")
			req, _ := http.NewRequest("PUT", "/api/watches/", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusNotFound)
		})

		Convey("rejects the update without valid json", func() {
			body := strings.NewReader("{\\}")
			req, _ := http.NewRequest("PUT", "/api/watches/99", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnprocessableEntity)
		})

		Convey("rejects the update without a user", func() {
			getUsername = func(_ *http.Request) string { return "" }

			body := strings.NewReader("{}")
			req, _ := http.NewRequest("PUT", "/api/watches/99", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnauthorized)
		})

		Convey("attempts update given a valid user", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }
			mock.ExpectQuery("SELECT .* FROM users WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id", "net_id", "creation_date", "last_modification_date",
				}).AddRow(1, "testuser", time.Now(), time.Now()))
			mock.ExpectExec("UPDATE saved_searches SET .* WHERE .*").
				WillReturnResult(sqlmock.NewResult(99, 1))

			body := strings.NewReader("{}")
			req, _ := http.NewRequest("PUT", "/api/watches/99", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusNoContent)
			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

	})
}

func TestDeleteSavedSearch(t *testing.T) {
	app := App()

	Convey("when deleting a saved search", t, func() {
		oldDb := db
		oldGetUsername := getUsername
		defer func() {
			getUsername = oldGetUsername
			db.Close()
			db = oldDb
		}()

		var mock sqlmock.Sqlmock
		var err error
		db, mock, err = sqlmock.New()
		if err != nil {
			t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
		}

		Convey("rejects the deletion without a valid id", func() {
			req, _ := http.NewRequest("DELETE", "/api/watches/", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusNotFound)
		})

		Convey("rejects the update without a user", func() {
			getUsername = func(_ *http.Request) string { return "" }

			req, _ := http.NewRequest("DELETE", "/api/watches/99", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnauthorized)
		})

		Convey("attempts deletion given a valid user", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }
			mock.ExpectQuery("SELECT .* FROM users WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id", "net_id", "creation_date", "last_modification_date",
				}).AddRow(1, "testuser", time.Now(), time.Now()))
			mock.ExpectExec("DELETE FROM saved_searches WHERE .*").
				WillReturnResult(sqlmock.NewResult(99, 1))

			req, _ := http.NewRequest("DELETE", "/api/watches/99", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusNoContent)
			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

	})
}
