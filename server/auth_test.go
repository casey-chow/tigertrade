package server

import (
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"os"
	"testing"
)

func TestAuthentication(t *testing.T) {
	app := App()

	Convey("GetCurrentUser", t, func() {

		Convey("returns the user profile", nil)

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

			req, _ := http.NewRequest("GET", "/api/user/redirect", nil)
			executeRequest(app, req)

			So(redirected, ShouldBeTrue)
		})

		Convey("should redirect to the client root", func() {
			// stub out environment variable
			oldClientRoot := os.Getenv("CLIENT_ROOT")
			os.Setenv("CLIENT_ROOT", "http://localhost:7373")
			defer os.Setenv("CLIENT_ROOT", oldClientRoot)

			isAuthenticated = func(r *http.Request) bool { return true }

			req, _ := http.NewRequest("GET", "/api/user/redirect", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
			So(res.Header().Get("Location"), ShouldEqual, "http://localhost:7373")
		})

		Convey("should redirect to an arbitrary valid URL", func() {
			isAuthenticated = func(r *http.Request) bool { return true }

			req, _ := http.NewRequest("GET", "/api/user/redirect?return=http%3A%2F%2Flocalhost%3A8888", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
			So(res.Header().Get("Location"), ShouldEqual, "http://localhost:8888")
		})

		Convey("should not redirect to an invalid URL", func() {
			isAuthenticated = func(r *http.Request) bool { return true }

			req, _ := http.NewRequest("GET", "/api/user/redirect?return=calh\\ost%3A8888", nil)
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

			req, _ := http.NewRequest("GET", "/api/user/logout", nil)
			executeRequest(app, req)

			So(redirected, ShouldBeTrue)
		})

		Convey("should redirect to the client root if logged out", func() {
			isAuthenticated = func(r *http.Request) bool { return false }

			req, _ := http.NewRequest("GET", "/api/user/logout", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
			So(res.Header().Get("Location"), ShouldEqual, "http://localhost:7373")
		})

		Convey("should redirect to the client, even if given a return param", func() {
			isAuthenticated = func(r *http.Request) bool { return false }

			req, _ := http.NewRequest("GET", "/api/user/logout?return=http%3A%2F%2Flocalhost%3A8888", nil)
			res := executeRequest(app, req)

			So(res.Code, ShouldEqual, http.StatusFound)
			So(res.Header().Get("Location"), ShouldEqual, "http://localhost:7373")
		})

	})

}
