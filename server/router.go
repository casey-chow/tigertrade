package server

import (
	"fmt"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

func Index(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprint(w, "Welcome!")
}

func Hello(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	fmt.Fprintf(w, "hello, %s!\n", ps.ByName("name"))
}

func Router() http.Handler {
	router := httprouter.New()

	router.GET("/", Index)
	router.GET("/hello/:name", Hello)

	router.GET("/login", CheckLoggedIn)
	router.GET("/logout", Logout)

	return router
}
