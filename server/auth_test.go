package server

import (
	. "github.com/smartystreets/goconvey/convey"
	"net/http"
	"os"
	"testing"
)

func TestAuthentication(t *testing.T) {
	app := App()

	Convey("CAS authentication", t, func() {

		// stub out key methods so we can modify their returns as needed
		oldIsAuthenticated := isAuthenticated
		oldRedirectToLogin := redirectToLogin
		oldRedirectToLogout := redirectToLogout
		oldGetUsername := getUsername
		defer func() {
			isAuthenticated = oldIsAuthenticated
			redirectToLogin = oldRedirectToLogin
			redirectToLogout = oldRedirectToLogout
			getUsername = oldGetUsername
		}()

		Convey("RedirectUser", func() {

			Convey("should redirect to CAS when not logged in", func() {
				var redirected = false

				isAuthenticated = func(_ *http.Request) bool { return false }
				redirectToLogin = func(_ http.ResponseWriter, _ *http.Request) { redirected = true }

				req, _ := http.NewRequest("GET", "/user/redirect", nil)
				executeRequest(app, req)

				So(redirected, ShouldBeTrue)
			})

			Convey("should redirect to the client root", func() {
				// stub out environment variable
				oldClientRoot := os.Getenv("CLIENT_ROOT")
				os.Setenv("CLIENT_ROOT", "http://localhost:7373")
				defer os.Setenv("CLIENT_ROOT", oldClientRoot)

				isAuthenticated = func(r *http.Request) bool { return true }

				req, _ := http.NewRequest("GET", "/user/redirect", nil)
				res := executeRequest(app, req)

				So(res.Code, ShouldEqual, http.StatusFound)
				So(res.Header().Get("Location"), ShouldEqual, "http://localhost:7373")
			})

			Convey("should redirect to an arbitrary valid URL", func() {
				isAuthenticated = func(r *http.Request) bool { return true }

				req, _ := http.NewRequest("GET", "/user/redirect?return=http%3A%2F%2Flocalhost%3A8888", nil)
				res := executeRequest(app, req)

				So(res.Code, ShouldEqual, http.StatusFound)
				So(res.Header().Get("Location"), ShouldEqual, "http://localhost:8888")
			})

			Convey("should not redirect to an invalid URL", func() {
				isAuthenticated = func(r *http.Request) bool { return true }

				req, _ := http.NewRequest("GET", "/user/redirect?return=calh\\ost%3A8888", nil)
				res := executeRequest(app, req)

				So(res.Code, ShouldEqual, http.StatusFound)
				So(res.Header().Get("Location"), ShouldNotEqual, "calhost:8888")
			})

		})

		Convey("Logout", func() {

			// stub out environment variable
			oldClientRoot := os.Getenv("CLIENT_ROOT")
			os.Setenv("CLIENT_ROOT", "http://localhost:7373")
			defer os.Setenv("CLIENT_ROOT", oldClientRoot)

			Convey("should redirect to CAS when logged in", func() {
				var redirected = false

				isAuthenticated = func(_ *http.Request) bool { return true }
				redirectToLogout = func(_ http.ResponseWriter, _ *http.Request) { redirected = true }

				req, _ := http.NewRequest("GET", "/user/logout", nil)
				executeRequest(app, req)

				So(redirected, ShouldBeTrue)
			})

			Convey("should redirect to the client root if logged out", func() {
				isAuthenticated = func(r *http.Request) bool { return false }

				req, _ := http.NewRequest("GET", "/user/logout", nil)
				res := executeRequest(app, req)

				So(res.Code, ShouldEqual, http.StatusFound)
				So(res.Header().Get("Location"), ShouldEqual, "http://localhost:7373")
			})

			Convey("should redirect to the client, even if given a return param", func() {
				isAuthenticated = func(r *http.Request) bool { return false }

				req, _ := http.NewRequest("GET", "/user/logout?return=http%3A%2F%2Flocalhost%3A8888", nil)
				res := executeRequest(app, req)

				So(res.Code, ShouldEqual, http.StatusFound)
				So(res.Header().Get("Location"), ShouldEqual, "http://localhost:7373")
			})

		})

	})
}
