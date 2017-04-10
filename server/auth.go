package server

import (
	"fmt"
	log "github.com/Sirupsen/logrus"
	"github.com/julienschmidt/httprouter"
	"gopkg.in/cas.v1"
	"net/http"
)

// logs in to CAS if not logged in, prints a hello message else
func CheckLoggedIn(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if !cas.IsAuthenticated(r) {
		// TODO: signal to client to log in to CAS
		cas.RedirectToLogin(w, r)
		return
	}

	fmt.Fprintf(w, "%s", cas.Username(r))
}

// logs out from CAS
func Logout(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	log.WithFields(log.Fields{
		"user": cas.Username(r),
	}).Info("logging out user")

	cas.RedirectToLogout(w, r)
}
