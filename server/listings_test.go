package server

import (
	"github.com/bitly/go-simplejson"
	. "github.com/smartystreets/goconvey/convey"
	"gopkg.in/DATA-DOG/go-sqlmock.v1"
	"net/http"
	"testing"
	"time"
)

func TestListings(t *testing.T) {
	app := App()

	Convey("ReadListings", t, func() {

		Convey("should return a list of listings", func() {
			req, _ := http.NewRequest("GET", "/api/listings", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res, shouldHaveContentType, "application/json")
			So(res.Body.String(), shouldBeJSON)
		})

	})

	Convey("ReadListing", t, func() {

		Convey("returns valid JSON", func() {
			req, _ := http.NewRequest("GET", "/api/listings", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res, shouldHaveContentType, "application/json")
			So(res.Body.String(), shouldBeJSON)
		})

		Convey("gets the listing with the proper id", nil)

	})

	Convey("CreateSeek", t, func() {

		Convey("works given invalid JSON", nil)

	})

}

func TestSearch(t *testing.T) {
	app := App()

	// Uses hardcoded data from the current testing database
	Convey("Search Functionality", t, func() {
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
			mock.ExpectQuery("SELECT .* FROM listings .* WHERE .* ").
				WillReturnRows(sqlmock.NewRows([]string{
					"listings.key_id", "listings.creation_date", "listings.last_modification_date",
					"title", "description", "user_id", "users.net_id",
					"price", "status", "expiration_date", "thumbnails.url", "starred_listings.is_starred",
				}).AddRow(
					1, time.Now(), time.Now(),
					"SampleValue", "Sampleish Value!",
					1, "Sam", 1001, "For Sale", time.Now(), "http://example.com/asf.gif", false,
				))

			req, _ := http.NewRequest("GET", "/api/listings?query=SampleValue", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res.Header().Get("Content-Type"), ShouldContainSubstring, "application/json")
			So(res.Body.String(), shouldBeJSON)

			result, err := simplejson.NewJson([]byte(res.Body.String()))
			So(err, ShouldBeNil)

			resultAsArray, err := result.Array()
			So(err, ShouldBeNil)
			So(len(resultAsArray), ShouldEqual, 1)

			listing := result.GetIndex(0)
			So(listing.Get("userId").MustInt(), ShouldEqual, 1)
			So(listing.Get("title").MustString(), ShouldContainSubstring, "SampleValue")

			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

		Convey("is case insensitive", func() {
			mock.ExpectQuery("SELECT .* FROM listings .* WHERE .* ").
				WillReturnRows(sqlmock.NewRows([]string{
					"listings.key_id", "listings.creation_date", "listings.last_modification_date",
					"title", "description", "user_id", "users.net_id",
					"price", "status", "expiration_date", "thumbnails.url", "starred_listings.is_starred",
				}).AddRow(
					1, time.Now(), time.Now(),
					"SampleValue", "Sampleish Value!",
					1, "Sam", 1001, "For Sale", time.Now(), "http://example.com/asf.gif", false,
				))

			req, _ := http.NewRequest("GET", "/api/listings?query=sAmPleVaLue", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res.Header().Get("Content-Type"), ShouldContainSubstring, "application/json")
			So(res.Body.String(), shouldBeJSON)

			result, err := simplejson.NewJson([]byte(res.Body.String()))
			So(err, ShouldBeNil)

			resultAsArray, err := result.Array()
			So(err, ShouldBeNil)
			So(len(resultAsArray), ShouldEqual, 1)

			listing := result.GetIndex(0)
			So(listing.Get("userId").MustInt(), ShouldEqual, 1)
			So(listing.Get("title").MustString(), ShouldContainSubstring, "SampleValue")

			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

		Convey("a search on a word in its description returns it", nil)

		Convey("a search on two words in its title/description returns it exactly once", nil)

		Convey("searching a word that is not in the title/description will not return it", nil)

		Convey("searching a word that is in multiple listings returns both", nil)

	})
}
