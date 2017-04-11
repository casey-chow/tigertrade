package server

import (
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"gopkg.in/cas.v1"
	"net/http"
	"net/url"
	"os"
)

// Use these variables so that we can mock them out in tests.
var isAuthenticated = cas.IsAuthenticated
var redirectToLogin = cas.RedirectToLogin
var redirectToLogout = cas.RedirectToLogout
var getUsername = cas.Username

// GetCurrentUser returns the current user.
func GetCurrentUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

}

// UserExists returns true if a user with the username exists.
func UserExists(username string) bool {
	query := psql.
		Select("key_id").From("users").
		Where(sq.Eq{"net_id": username}).
		Limit(1)

	rows, err := query.RunWith(db).Query()
	if err != nil {
		raven.CaptureError(err, map[string]string{"username": username})
		log.WithField("username", username).
			Error("database query failed in EnsureUserExists")
	}
	defer rows.Close()

	for rows.Next() {
		return true
	}
	return false
}

// EnsureUserExists makes sure the username exists in the db, creating it if
// it doesn't already.
func EnsureUserExists(username string) {
	if exists := UserExists(username); exists {
		return
	}

	log.WithField("username", username).
		Print("creating user")
	query := psql.Insert("users").
		Columns("net_id").Values(username)

	if _, err := query.RunWith(db).Query(); err != nil {
		log.WithFields(log.Fields{
			"err":      err,
			"username": username,
		}).Error("could not insert user")
	}
}

// RedirectUser redirects the user to CAS authentication if they are not
// logged in, and back to the "return" parameter otherwise.
func RedirectUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if !isAuthenticated(r) {
		log.Info("logging in user")
		redirectToLogin(w, r)
		return
	}

	go EnsureUserExists(getUsername(r))

	// TODO: Validate the return parameter for domain correctness
	redirect := r.URL.Query().Get("return")

	// Validate the URL given to us
	_, err := url.Parse(redirect)
	if err != nil {
		log.WithFields(log.Fields{"error": err, "url": redirect}).
			Info("RedirectUser received invalid url")
		raven.CaptureError(err, map[string]string{"url": redirect})
	}

	if err != nil || redirect == "" {
		redirect = os.Getenv("CLIENT_ROOT")
	}

	log.WithFields(log.Fields{"user": getUsername(r), "url": redirect}).
		Info("login: redirecting user back to app")
	http.Redirect(w, r, redirect, http.StatusFound)
}

// LogoutUser logs the user out from CAS, if they are logged in, and redirects
// to app root.
func LogoutUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if isAuthenticated(r) {
		log.WithField("user", getUsername(r)).
			Info("logging out user")
		redirectToLogout(w, r)
	} else {
		log.Info("logout: redirecting user back to app")
		http.Redirect(w, r, os.Getenv("CLIENT_ROOT"), http.StatusFound)
	}
}
