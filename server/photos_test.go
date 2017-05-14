package server

import (
	. "github.com/smartystreets/goconvey/convey"
	// "gopkg.in/DATA-DOG/go-sqlmock.v1"
	"net/http"
	"testing"
	// "time"
)

func TestCreatePhoto(t *testing.T) {
	app := App()

	Convey("when a user uploads a photo", t, func() {

		Convey("validates that a user is logged in", func() {
			getUsername = func(_ *http.Request) string { return "" }

			req, _ := http.NewRequest("POST", "/api/photos", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusUnauthorized)
		})

		Convey("attempts to read a file", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }

			req, _ := http.NewRequest("POST", "/api/photos", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusInternalServerError)
		})

		Convey("resizes the image", nil)

		Convey("uploads the image to S3", nil)

	})

}
