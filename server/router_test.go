package server

import (
	"fmt"
	"github.com/appleboy/gofight"
	. "github.com/smartystreets/goconvey/convey"
	"gopkg.in/h2non/gock.v1"
	"net/http"
	"testing"
)

func TestRouter(t *testing.T) {
	Convey("the index page", t, func() {
		r := gofight.New()

		Convey("should return OK", func() {
			r.GET("/").
				Run(App(), func(r gofight.HTTPResponse, rq gofight.HTTPRequest) {
					So(r.Body.String(), ShouldEqual, "Welcome!")
					So(r.Code, ShouldEqual, http.StatusOK)
				})
		})
	})

	Convey("CAS authentication", t, func() {
		r := gofight.New()

		Convey("should redirect to CAS when not logged in", func() {
			defer gock.Off()
			gock.New("https://fed.princeton.edu").
				Get("/cas/validate").
				Reply(200).
				BodyString("no\n\n")

			r.GET("/login").
				Run(App(), func(r gofight.HTTPResponse, rq gofight.HTTPRequest) {
					So(r.Code, ShouldEqual, http.StatusFound)
				})
		})

		// TODO: Figure out why this test doesn't work
		SkipConvey("should return the proper user when logged in", func() {
			defer gock.Off()
			gock.New("https://fed.princeton.edu").
				Get("/cas/validate").
				Reply(200).
				BodyString("yes\ntestuser\n")

			r.GET("/login").
				Run(App(), func(r gofight.HTTPResponse, rq gofight.HTTPRequest) {
					fmt.Printf("body: %s", r.Body.String())
					So(r.Code, ShouldEqual, http.StatusOK)
					So(r.Body.String(), ShouldEqual, "testuser")
				})
		})
	})
}
