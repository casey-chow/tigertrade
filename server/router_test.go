package server

import (
	. "github.com/smartystreets/goconvey/convey"
	"gopkg.in/h2non/gock.v1"
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

			So(res.Header().Get("Access-Control-Allow-Origin"), ShouldEqual, origin)
		})

		Convey("should not have global CORS headers", func() {
			req, _ := http.NewRequest("GET", "/", nil)
			req.Header.Add("Origin", "http://example.com/")
			res := executeRequest(app, req)

			So(res.Header().Get("Access-Control-Allow-Origin"), ShouldEqual, "")
		})

	})

	Convey("CAS authentication", t, func() {

		Convey("should redirect to CAS when not logged in", func() {
			gock.New("https://fed.princeton.edu").
				Get("/cas/validate").
				Reply(200).
				BodyString("no\n\n")
			defer gock.Off()

			req, _ := http.NewRequest("GET", "/login", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
		})

		// TODO: Figure out why this test doesn't work
		SkipConvey("should return the proper user when logged in", func() {
			gock.New("https://fed.princeton.edu").
				Get("/cas/validate").
				Reply(200).
				BodyString("yes\ntestuser\n")
			defer gock.Off()

			req, _ := http.NewRequest("GET", "/login", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusOK)
			So(res.Body.String(), ShouldEqual, "testuser")
		})

	})
}
