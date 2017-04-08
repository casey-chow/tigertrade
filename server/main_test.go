package server

import (
	"github.com/appleboy/gofight"
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"testing"
)

func TestIndexPage(t *testing.T) {
	Convey("the index page", t, func() {
		r := gofight.New()

		Convey("should return OK", func() {
			r.GET("/").
				Run(RouterEngine(), func(r gofight.HTTPResponse, rq gofight.HTTPRequest) {
					So(r.Body.String(), ShouldEqual, "Welcome!")
					So(r.Code, ShouldEqual, http.StatusOK)
				})
		})
	})
}
