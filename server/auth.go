package server

import (
	"database/sql"
	sq "github.com/Masterminds/squirrel"
	log "github.com/Sirupsen/logrus"
	"github.com/getsentry/raven-go"
	"github.com/guregu/null"
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

// User represents a user of the app.
type User struct {
	KeyID                int       `json:"keyId"`
	CreationDate         null.Time `json:"creationDate"`
	LastModificationDate null.Time `json:"lastModificationDate"`
	NetID                string    `json:"netId"`
}

// getUser gets the specified user, and HTTP codes corresponding. If does
// not exist, returns nil, 404, err.
func getUser(netID string) (*User, int, error) {
	query := psql.
		Select("key_id", "net_id", "creation_date", "last_modification_date").
		From("users").
		Where(sq.Eq{"net_id": netID}).
		Limit(1)

	user := new(User)
	err := query.RunWith(db).
		QueryRow().
		Scan(
			&user.KeyID,
			&user.NetID,
			&user.CreationDate,
			&user.LastModificationDate,
		)
	if err == sql.ErrNoRows {
		return nil, 404, err
	} else if err != nil {
		return nil, 500, err
	}

	return user, 0, nil
}

// ServeCurrentUser returns the current user, or an empty JSON object if not logged in.
func ServeCurrentUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	netID := getUsername(r)
	user, code, err := getUser(netID)
	if err != nil {
		http.Error(w, http.StatusText(code), code)
	}

	if err != nil && err != sql.ErrNoRows {
		raven.CaptureError(err, map[string]string{"username": netID})
		log.WithFields(log.Fields{
			"err":      err,
			"username": netID,
		}).Error("encountered error while retrieving user")
	} else {
		Serve(w, user)
	}
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
