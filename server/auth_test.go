package server

import (
	. "github.com/smartystreets/goconvey/convey"
	"gopkg.in/DATA-DOG/go-sqlmock.v1"
	"net/http"
	"os"
	"testing"
	"time"
)

func TestAuthentication(t *testing.T) {
	app := App()

	Convey("ServeCurrentUser", t, func() {
		oldIsAuthenticated := isAuthenticated
		oldGetUsername := getUsername
		oldDb := db
		defer func() {
			isAuthenticated = oldIsAuthenticated
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

		Convey("returns a 404 if not found", func() {
			getUsername = func(_ *http.Request) string { return "" }

			req, _ := http.NewRequest("GET", "/api/users/current", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusNotFound)
		})

		Convey("creates a user if they do not already exist in the database", nil)

		Convey("returns the user profile if logged in", func() {
			getUsername = func(_ *http.Request) string { return "testuser" }
			mock.ExpectQuery("SELECT .* FROM users WHERE .*").
				WillReturnRows(sqlmock.NewRows([]string{
					"key_id", "net_id", "creation_date", "last_modification_date",
				}).AddRow(1, "testuser", time.Now(), time.Now()))

			req, _ := http.NewRequest("GET", "/api/users/current", nil)
			res := executeRequest(app, req)

			// TODO: more advanced JSON matching
			So(res.Code, ShouldEqual, http.StatusOK)
			So(mock.ExpectationsWereMet(), ShouldBeNil)
		})

	})

	Convey("UserExists", t, func() {

		Convey("returns true when the user exists", nil)

		Convey("returns false when the user does not exist", nil)

	})

	Convey("EnsureUserExists", t, func() {

		Convey("creates the user if they do not exist", nil)

		Convey("does not create a user that already exists", nil)

	})

	Convey("RedirectUser", t, func() {

		oldIsAuthenticated := isAuthenticated
		oldRedirectToLogin := redirectToLogin
		defer func() {
			isAuthenticated = oldIsAuthenticated
			redirectToLogin = oldRedirectToLogin
		}()

		Convey("should redirect to CAS when not logged in", func() {
			var redirected = false

			isAuthenticated = func(_ *http.Request) bool { return false }
			redirectToLogin = func(_ http.ResponseWriter, _ *http.Request) { redirected = true }

			req, _ := http.NewRequest("GET", "/api/users/redirect", nil)
			executeRequest(app, req)

			So(redirected, ShouldBeTrue)
		})

		Convey("should redirect to the client root", func() {
			// stub out environment variable
			oldClientRoot := os.Getenv("CLIENT_ROOT")
			os.Setenv("CLIENT_ROOT", "http://localhost:7373")
			defer os.Setenv("CLIENT_ROOT", oldClientRoot)

			isAuthenticated = func(r *http.Request) bool { return true }

			req, _ := http.NewRequest("GET", "/api/users/redirect", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
			So(res.Header().Get("Location"), ShouldEqual, "http://localhost:7373")
		})

		Convey("should redirect to an arbitrary valid URL", func() {
			isAuthenticated = func(r *http.Request) bool { return true }

			req, _ := http.NewRequest("GET", "/api/users/redirect?return=http%3A%2F%2Flocalhost%3A8888", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
			So(res.Header().Get("Location"), ShouldEqual, "http://localhost:8888")
		})

		Convey("should not redirect to an invalid URL", func() {
			isAuthenticated = func(r *http.Request) bool { return true }

			req, _ := http.NewRequest("GET", "/api/users/redirect?return=calh\\ost%3A8888", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
			So(res.Header().Get("Location"), ShouldNotEqual, "calhost:8888")
		})

	})

	Convey("LogoutUser", t, func() {

		oldIsAuthenticated := isAuthenticated
		oldRedirectToLogout := redirectToLogout
		oldClientRoot := os.Getenv("CLIENT_ROOT")
		os.Setenv("CLIENT_ROOT", "http://localhost:7373")
		defer func() {
			isAuthenticated = oldIsAuthenticated
			redirectToLogout = oldRedirectToLogout
			os.Setenv("CLIENT_ROOT", oldClientRoot)
		}()

		Convey("should redirect to CAS when logged in", func() {
			var redirected = false

			isAuthenticated = func(_ *http.Request) bool { return true }
			redirectToLogout = func(_ http.ResponseWriter, _ *http.Request) { redirected = true }

			req, _ := http.NewRequest("GET", "/api/users/logout", nil)
			executeRequest(app, req)

			So(redirected, ShouldBeTrue)
		})

		Convey("should redirect to the client root if logged out", func() {
			isAuthenticated = func(r *http.Request) bool { return false }

			req, _ := http.NewRequest("GET", "/api/users/logout", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
			So(res.Header().Get("Location"), ShouldEqual, "http://localhost:7373")
		})

		Convey("should redirect to the client, even if given a return param", func() {
			isAuthenticated = func(r *http.Request) bool { return false }

			req, _ := http.NewRequest("GET", "/api/users/logout?return=http%3A%2F%2Flocalhost%3A8888", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
			So(res.Header().Get("Location"), ShouldEqual, "http://localhost:7373")
		})

	})

}
