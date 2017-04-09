package server

import (
	"github.com/urfave/negroni"
	"gopkg.in/cas.v1"
	"net/http"
	"net/url"
)

func makeCASMiddleware() negroni.Handler {
	casUrl, _ := url.Parse("https://fed.princeton.edu/cas/")
	casClient := cas.NewClient(&cas.Options{URL: casUrl})

	// Thin wrapper on go-cas's middleware
	return negroni.HandlerFunc(func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		casClient.Handle(next).ServeHTTP(w, r)
	})
}

func App() http.Handler {
	app := negroni.New()

	app.Use(makeCASMiddleware())
	app.Use(negroni.NewRecovery())
	app.Use(negroni.NewLogger())
	app.UseHandler(Router())

	return app
}
