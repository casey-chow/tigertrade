package server

import (
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"os"
	"testing"
)

func TestRouter(t *testing.T) {
	app := App()

	Convey("the index page", t, func() {

		Convey("should return OK", func() {
			req, _ := http.NewRequest("GET", "/", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res.Body.String(), ShouldEqual, "Welcome!")
		})

		Convey("should have CORS headers", func() {
			origin := os.Getenv("CLIENT_ROOT")
			req, _ := http.NewRequest("GET", "/", nil)
			req.Header.Add("Origin", origin)
			res := executeRequest(app, req)

			So(origin, ShouldNotEqual, "")
			So(res.Header().Get("Access-Control-Allow-Origin"), ShouldEqual, origin)
		})

		Convey("should not have global CORS headers", func() {
			req, _ := http.NewRequest("GET", "/", nil)
			req.Header.Add("Origin", "http://example.com/")
			res := executeRequest(app, req)

			So(res.Header().Get("Access-Control-Allow-Origin"), ShouldEqual, "")
		})

	})

}
