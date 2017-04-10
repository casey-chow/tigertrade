package server

import (
	. "github.com/smartystreets/goconvey/convey"
	"gopkg.in/h2non/gock.v1"
	"net/http"
	"testing"
)

func TestAuthentication(t *testing.T) {
	app := App()

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
