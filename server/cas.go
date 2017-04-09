package server

import (
	"gopkg.in/cas.v1"
)

// logs in to CAS if not logged in, prints a hello message else
func CheckLoggedIn(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	if !cas.IsAuthenticated(r) {
		// TODO: signal to client to log in to CAS
		cas.RedirectToLogin(w, r)
		return
	}

	fmt.Fprintf(w, "hello, %s", cas.Username(r))
}

// logs out from CAS
func Logout(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	cas.RedirectToLogout(w, r)
}
