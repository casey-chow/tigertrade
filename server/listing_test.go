package server

import (
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"testing"
)

func TestListings(t *testing.T) {
	app := App()

	Convey("listings index", t, func() {

		Convey("should return a list of listings", func() {
			req, _ := http.NewRequest("GET", "/api/listings", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res.Header().Get("Content-Type"), ShouldEqual, "application/json;charset=utf-8")
			So(isJSON(res.Body.String()), ShouldBeTrue)
		})

	})
}
