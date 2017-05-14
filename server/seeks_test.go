package server

import (
	"github.com/bitly/go-simplejson"
	. "github.com/smartystreets/goconvey/convey"
	"gopkg.in/DATA-DOG/go-sqlmock.v1"
	"net/http"
	"strings"
	"testing"
	"time"
)

func TestReadSeeks(t *testing.T) {
	app := App()

	Convey("when showing all seeks", t, func() {

		Convey("should return a list of seeks", func() {
			req, _ := http.NewRequest("GET", "/api/seeks", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res, shouldHaveContentType, "application/json")
			So(res.Body.String(), shouldBeJSON)
		})

		Convey("should return correctly given parameters", func() {
			reqURL := "/api/seeks?limit=40&offset=10&minPrice=0&maxPrice=0&minExpDate=0&maxExpDate=0&minCreateDate=0"
			req, _ := http.NewRequest("GET", reqURL, nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res, shouldHaveContentType, "application/json")
			So(res.Body.String(), shouldBeJSON)
		})

	})

	Convey("when searching for seeks", t, func() {
		oldDb := db
		defer func() {
			db.Close()
			db = oldDb
		}()

		var mock sqlmock.Sqlmock
		var err error
		db, mock, err = sqlmock.New()
		if err != nil {
			t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
		}

		Convey("a search on a word in its title returns it", func() {
			mock.ExpectQuery("SELECT .* FROM seeks .* WHERE .* ").
				WillReturnRows(sqlmock.NewRows([]string{
					"seeks.key_id",
					"seeks.creation_date",
					"seeks.last_modification_date",
					"title",
					"description",
					"user_id",
					"users.net_id",
					"saved_search_id",
					"notify_enabled",
					"status",
				}).AddRow(
					1,
					time.Now(),
					time.Now(),
					"SampleValue",
					"Sampleish Value!",
					1,
					"Sam",
					1001,
					false,
					"For Sale",
				))

			req, _ := http.NewRequest("GET", "/api/seeks?query=SampleValue", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res.Header().Get("Content-Type"), ShouldContainSubstring, "application/json")
			So(res.Body.String(), shouldBeJSON)

			result, err := simplejson.NewJson([]byte(res.Body.String()))
			So(err, ShouldBeNil)

			resultAsArray, err := result.Array()
			So(err, ShouldBeNil)
			So(len(resultAsArray), ShouldEqual, 1)

			seek := result.GetIndex(0)
			So(seek.Get("userId").MustInt(), ShouldEqual, 1)
			So(seek.Get("username").MustString(), ShouldEqual, "Sam")
			So(seek.Get("title").MustString(), ShouldContainSubstring, "SampleValue")

			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

		Convey("is case insensitive", func() {
			mock.ExpectQuery("SELECT .* FROM seeks .* WHERE .* ").
				WillReturnRows(sqlmock.NewRows([]string{
					"seeks.key_id",
					"seeks.creation_date",
					"seeks.last_modification_date",
					"title",
					"description",
					"user_id",
					"users.net_id",
					"saved_search_id",
					"notify_enabled",
					"status",
				}).AddRow(
					1,
					time.Now(),
					time.Now(),
					"SampleValue",
					"Sampleish Value!",
					1,
					"Sam",
					1001,
					false,
					"For Sale",
				))

			req, _ := http.NewRequest("GET", "/api/seeks?query=sAmPleVaLue", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res.Header().Get("Content-Type"), ShouldContainSubstring, "application/json")
			So(res.Body.String(), shouldBeJSON)

			result, err := simplejson.NewJson([]byte(res.Body.String()))
			So(err, ShouldBeNil)

			resultAsArray, err := result.Array()
			So(err, ShouldBeNil)
			So(len(resultAsArray), ShouldEqual, 1)

			seek := result.GetIndex(0)
			So(seek.Get("userId").MustInt(), ShouldEqual, 1)
			So(seek.Get("username").MustString(), ShouldEqual, "Sam")
			So(seek.Get("title").MustString(), ShouldContainSubstring, "SampleValue")

			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

		Convey("a search on a word in its description returns it", nil)

		Convey("a search on two words in its title/description returns it exactly once", nil)

		Convey("searching a word that is not in the title/description will not return it", nil)

		Convey("searching a word that is in multiple seeks returns both", nil)
	})

}

func TestReadSeek(t *testing.T) {
	app := App()

	Convey("ReadSeek", t, func() {
		oldDb := db
		defer func() {
			db.Close()
			db = oldDb
		}()

		var mock sqlmock.Sqlmock
		var err error
		db, mock, err = sqlmock.New()
		if err != nil {
			t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
		}

		Convey("returns valid JSON", func() {
			mock.ExpectQuery("SELECT .* FROM seeks .* WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"seeks.key_id",
					"seeks.creation_date",
					"seeks.last_modification_date",
					"title",
					"description",
					"user_id",
					"users.net_id",
					"saved_search_id",
					"notify_enabled",
					"status",
				}).AddRow(
					140,
					time.Now(),
					time.Now(),
					"SampleValue",
					"Sampleish Value!",
					1,
					"Sam",
					1001,
					false,
					"For Sale",
				))
			req, _ := http.NewRequest("GET", "/api/seeks/140", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res, shouldHaveContentType, "application/json")
			So(res.Body.String(), shouldBeJSON)

			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

		Convey("gets the seek with the proper id", nil)

	})

}

func TestCreateSeek(t *testing.T) {
	app := App()

	Convey("when creating a seek", t, func() {
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

		Convey("rejects the seek without valid json", func() {
			body := strings.NewReader("{\\}")
			req, _ := http.NewRequest("POST", "/api/seeks", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnprocessableEntity)
		})

		Convey("rejects the seek without a user", func() {
			body := strings.NewReader("{}")
			req, _ := http.NewRequest("POST", "/api/seeks", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnauthorized)
		})

		Convey("attempts seek creation given a valid user", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }
			mock.ExpectQuery("SELECT .* FROM users WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id", "net_id", "creation_date", "last_modification_date",
				}).AddRow(1, "testuser", time.Now(), time.Now()))
			mock.ExpectQuery("INSERT INTO seeks .* VALUES .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id",
					"creation_date",
				}).AddRow(1, time.Now()))

			body := strings.NewReader("{}")
			req, _ := http.NewRequest("POST", "/api/seeks", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusCreated)
			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})
	})
}

func TestUpdateSeek(t *testing.T) {
	app := App()

	Convey("when updating a seek", t, func() {
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
			req, _ := http.NewRequest("PUT", "/api/seeks/", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusNotFound)
		})

		Convey("rejects the update without valid json", func() {
			body := strings.NewReader("{\\}")
			req, _ := http.NewRequest("PUT", "/api/seeks/99", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnprocessableEntity)
		})

		Convey("rejects the update without a user", func() {
			getUsername = func(_ *http.Request) string { return "" }

			body := strings.NewReader("{}")
			req, _ := http.NewRequest("PUT", "/api/seeks/99", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnauthorized)
		})

		Convey("attempts update given a valid user", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }
			mock.ExpectQuery("SELECT .* FROM users WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id", "net_id", "creation_date", "last_modification_date",
				}).AddRow(1, "testuser", time.Now(), time.Now()))
			mock.ExpectExec("UPDATE seeks SET .* WHERE .*").
				WillReturnResult(sqlmock.NewResult(99, 1))

			body := strings.NewReader("{}")
			req, _ := http.NewRequest("PUT", "/api/seeks/99", body)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusNoContent)
			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

	})
}

func TestDeleteSeek(t *testing.T) {
	app := App()

	Convey("when deleting a seek", t, func() {
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
			req, _ := http.NewRequest("DELETE", "/api/seeks/", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusNotFound)
		})

		Convey("rejects the update without a user", func() {
			getUsername = func(_ *http.Request) string { return "" }

			req, _ := http.NewRequest("DELETE", "/api/seeks/99", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnauthorized)
		})

		Convey("attempts deletion given a valid user", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }
			mock.ExpectQuery("SELECT .* FROM users WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id", "net_id", "creation_date", "last_modification_date",
				}).AddRow(1, "testuser", time.Now(), time.Now()))
			mock.ExpectExec("DELETE FROM seeks WHERE .*").
				WillReturnResult(sqlmock.NewResult(99, 1))

			req, _ := http.NewRequest("DELETE", "/api/seeks/99", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusNoContent)
			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

	})
}
