package server

import (
	"bufio"
	"database/sql"
	"flag"
	"github.com/getsentry/raven-go"
	_ "github.com/lib/pq"
	"github.com/urfave/negroni"
	"gopkg.in/cas.v1"
	"log"
	"net/http"
	"net/url"
	"os"
	"path"
	"runtime"
	"strings"
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

// Manually loads config variables from .env file if they are not already.
// This is a workaround because we're not starting the app with heroku local.
func loadEnvironment() {
	if os.Getenv("CONFIG_PRESENT") == "true" {
		return
	}
	log.Print("Heroku config variables not present. Loading manually from .env")

	// Open .env file
	_, filename, _, _ := runtime.Caller(1)
	file, err := os.Open(path.Join(path.Dir(filename), "../.env"))

	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)

	// set each enclosed config var in environment
	for scanner.Scan() {
		args := strings.Split(scanner.Text(), "=")
		os.Setenv(args[0], args[1])
	}

	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}

}

// Connects to database specified in DATABASE_URL env variable.
func initDatabase() {
	var err error
	db, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		raven.CaptureErrorAndWait(err, nil)
		log.Fatal(err)
	} else {
		log.Print("Connected to database")
	}

	if err = db.Ping(); err != nil {
		raven.CaptureErrorAndWait(err, nil)
		log.Fatal(err)
	}
}

func App() http.Handler {
	loadEnvironment()
	initDatabase()

	app := negroni.New()

	app.Use(CASMiddleware())

	// if not in testing
	if flag.Lookup("test.v") == nil {
		app.Use(SentryMiddleware())
		app.Use(negroni.NewLogger())
	}

	app.UseHandler(Router())

	return app
}
