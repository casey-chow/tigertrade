package server

import (
	"bufio"
	"database/sql"
	"flag"
	log "github.com/Sirupsen/logrus"
	"github.com/binjianwu/cas" // NOTE: use this until https://github.com/go-cas/cas/pull/10 is merged
	"github.com/getsentry/raven-go"
	_ "github.com/lib/pq"
	"github.com/meatballhat/negroni-logrus"
	"github.com/rs/cors"
	"github.com/urfave/negroni"
	"net/http"
	"net/url"
	"os"
	"path"
	"runtime"
	"strings"
)

var db *sql.DB

func casMiddleware() negroni.Handler {
	casUrl, _ := url.Parse("https://fed.princeton.edu/cas/")
	casClient := cas.NewClient(&cas.Options{
		URL:         casUrl,
		SendService: true,
	})

	// Thin wrapper on go-cas's middleware
	return negroni.HandlerFunc(func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		casClient.Handle(next).ServeHTTP(w, r)
	})
}

func sentryMiddleware() negroni.Handler {
	return negroni.HandlerFunc(func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		raven.RecoveryHandler(next)(w, r)
	})
}

func logMiddleware() negroni.Handler {
	if os.Getenv("ENVIRONMENT") == "production" {
		return negronilogrus.NewCustomMiddleware(log.InfoLevel, &log.JSONFormatter{}, "web")
	}

	return negronilogrus.NewCustomMiddleware(log.InfoLevel, &log.TextFormatter{}, "web")
}

func corsMiddleware() negroni.Handler {
	log.WithField("CLIENT_ROOT", os.Getenv("CLIENT_ROOT")).Print("activating CORS header")
	return cors.New(cors.Options{
		AllowedMethods:   []string{"GET", "POST", "PUT", "UPDATE", "DELETE"},
		AllowedOrigins:   []string{os.Getenv("CLIENT_ROOT")},
		AllowCredentials: true,
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

// customize logging
func init() {
	if os.Getenv("ENVIRONMENT") == "production" {
		// Log as JSON instead of the default ASCII formatter.
		log.SetFormatter(&log.JSONFormatter{})
	}

	// Output to stdout instead of the default stderr
	log.SetOutput(os.Stdout)

	// raise loglevel for tests
	if flag.Lookup("test.v") != nil {
		log.SetLevel(log.WarnLevel)
	}
}

func App() http.Handler {
	loadEnvironment()
	initDatabase()

	app := negroni.New()

	app.Use(casMiddleware())
	app.Use(sentryMiddleware())
	app.Use(logMiddleware())
	app.Use(corsMiddleware())

	app.UseHandler(Router())

	return app
}
