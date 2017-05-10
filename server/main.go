package server

import (
	"bufio"
	"database/sql"
	"flag"
	log "github.com/Sirupsen/logrus"
	"github.com/TheGuyWithTheFace/cas" // NOTE: use this until https://github.com/go-cas/cas/pull/10 and pytimer's fork are merged
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/getsentry/raven-go"
	_ "github.com/lib/pq"
	"github.com/meatballhat/negroni-logrus"
	"github.com/phyber/negroni-gzip/gzip"
	"github.com/rs/cors"
	"github.com/urfave/negroni"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"
)

var db *sql.DB
var uploader *s3manager.Uploader

func casMiddleware() negroni.Handler {
	casURL, _ := url.Parse("https://fed.princeton.edu/cas/")
	casClient := cas.NewClient(&cas.Options{
		URL:         casURL,
		SendService: true,
		Secure:      os.Getenv("DEBUG") != "true",
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
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedOrigins:   []string{os.Getenv("CLIENT_ROOT")},
		AllowCredentials: true,
	})
}

// Manually loads config variables from .env file if they are not already.
// This is a workaround because we're not starting the app with Heroku local
func loadEnvironment() {
	if os.Getenv("CONFIG_PRESENT") == "true" {
		return
	}
	log.Print("environment variables not found, loading environment from .env")

	// Open .env file
	path := path.Join(os.Getenv("GOPATH"), "src/github.com/casey-chow/tigertrade/.env")
	file, err := os.Open(path)

	if err != nil {
		log.WithField("err", err).Fatal("Unable to load .env file: file not found")
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)

	// set each enclosed config var in environment
	for scanner.Scan() {
		args := strings.Split(scanner.Text(), "=")
		os.Setenv(args[0], args[1])
	}

	if err := scanner.Err(); err != nil {
		log.WithField("err", err).Fatal("Unable to set config vars in environment")
	}

}

// Connects to database specified in DATABASE_URL env variable
func initDatabase() {
	var err error
	db, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		raven.CaptureErrorAndWait(err, nil)
		log.WithField("err", err).Fatal("unable to open postgres database")
	} else {
		log.Print("connected to database")
	}

	if err = db.Ping(); err != nil {
		raven.CaptureErrorAndWait(err, nil)
		log.WithField("err", err).Fatal("unable to connect to postgres database")
	}
}

func initS3() {
	creds := credentials.NewEnvCredentials()
	_, err := creds.Get()
	if err != nil {
		log.WithError(err).Info("error while creating aws credentials")
	}

	cfg := aws.NewConfig().
		WithRegion(os.Getenv("AWS_REGION")).
		WithCredentials(creds)

	sess := session.Must(session.NewSession(cfg))

	uploader = s3manager.NewUploader(sess)
}

// customize logging
func init() {
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
	initS3()

	app := negroni.New()

	app.Use(casMiddleware())
	app.Use(sentryMiddleware())
	app.Use(logMiddleware())
	app.Use(gzip.Gzip(gzip.DefaultCompression))
	app.Use(corsMiddleware())

	app.UseHandler(Router())

	return app
}
