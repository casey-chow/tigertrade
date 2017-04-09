package server

import (
	_ "github.com/lib/pq"
	"database/sql"
	"github.com/getsentry/raven-go"
	"github.com/urfave/negroni"
	"gopkg.in/cas.v1"
	"log"
	"net/http"
	"net/url"
	"os"
)

var db *sql.DB

func CASMiddleware() negroni.Handler {
	casUrl, _ := url.Parse("https://fed.princeton.edu/cas/")
	casClient := cas.NewClient(&cas.Options{URL: casUrl})

	// Thin wrapper on go-cas's middleware
	return negroni.HandlerFunc(func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		casClient.Handle(next).ServeHTTP(w, r)
	})
}

func SentryMiddleware() negroni.Handler {
	return negroni.HandlerFunc(func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		raven.RecoveryHandler(next)(w, r)
	})
}

// Connects to database specified in DATABASE_URL env variable.
func InitDatabase() {
	// Connect to Database
	var err error
	db, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	} else {
		log.Print("Connected to database")
	}

	// Test connection
	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}
}

func App() http.Handler {
	app := negroni.New()


	app.Use(CASMiddleware())
	app.Use(SentryMiddleware())
	app.Use(negroni.NewLogger())
	app.UseHandler(Router())

	return app
}
