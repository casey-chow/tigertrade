package server

import (
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"testing"
)

func TestListings(t *testing.T) {
	app := App()

	Convey("ServeRecentListings", t, func() {

		Convey("should return a list of listings", func() {
			req, _ := http.NewRequest("GET", "/api/listings", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res, shouldHaveContentType, "application/json")
			So(res.Body.String(), shouldBeJSON)
		})

	})

	Convey("ServeListingById", t, func() {

		Convey("returns valid JSON", func() {
			req, _ := http.NewRequest("GET", "/api/listings", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res, shouldHaveContentType, "application/json")
			So(res.Body.String(), shouldBeJSON)
		})

		Convey("gets the listing with the proper id", nil)

	})

	Convey("ServeAddSeek", t, func() {

		Convey("works given invalid JSON", nil)

	})

}
