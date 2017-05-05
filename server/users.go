package server

import (
	log "github.com/Sirupsen/logrus"
	"github.com/TheGuyWithTheFace/cas"
	"github.com/casey-chow/tigertrade/server/models"
	"github.com/getsentry/raven-go"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"net/url"
	"os"
)

// Use these variables so that we can mock them out in tests.
var isAuthenticated = cas.IsAuthenticated
var redirectToLogin = cas.RedirectToLogin
var redirectToLogout = cas.RedirectToLogout
var getUsername = cas.Username

// GetCurrentUser returns the current user, or an empty JSON object if not logged in.
func GetCurrentUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	netID := getUsername(r)
	log.WithField("netID", netID).Debug("getting username")
	if netID == "" {
		Error(w, http.StatusUnauthorized)
		return
	}

	user, err := models.GetOrCreateUser(db, netID)
	if err != nil {
		raven.CaptureError(err, map[string]string{"username": netID})
		log.WithFields(log.Fields{
			"err":   err,
			"netID": netID,
		}).Error("encountered error while retrieving user")
		Error(w, http.StatusInternalServerError)
		return
	}

	Serve(w, user)
}

// RedirectUser redirects the user to CAS authentication if they are not
// logged in, and back to the "return" parameter otherwise.
func RedirectUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if !isAuthenticated(r) {
		log.Debug("logging in user")
		redirectToLogin(w, r)
		return
	}

	go models.GetOrCreateUser(db, getUsername(r))

	// TODO: Validate the return parameter for domain correctness
	redirect := r.URL.Query().Get("return")

	// Validate the URL given to us
	_, err := url.Parse(redirect)
	if err != nil {
		log.WithFields(log.Fields{"error": err, "url": redirect}).
			Warn("RedirectUser received invalid url")
		raven.CaptureError(err, map[string]string{"url": redirect})
	}

	if err != nil || redirect == "" {
		redirect = os.Getenv("CLIENT_ROOT")
	}

	log.WithFields(log.Fields{"user": getUsername(r), "url": redirect}).
		Debug("login: redirecting user back to app")
	http.Redirect(w, r, redirect, http.StatusFound)
}

// LogoutUser logs the user out from CAS, if they are logged in, and redirects
// to app root.
func LogoutUser(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if isAuthenticated(r) {
		log.WithField("user", getUsername(r)).
			Debug("logging out user")
		redirectToLogout(w, r)
	} else {
		log.Debug("logout: redirecting user back to app")
		http.Redirect(w, r, os.Getenv("CLIENT_ROOT"), http.StatusFound)
	}
}
