package server

import (
	"fmt"
	"github.com/golang/glog"
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
	glog.Infof("logging out user: %s", cas.Username(r))
	cas.RedirectToLogout(w, r)
}
