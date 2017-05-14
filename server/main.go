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
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"strings"
)

var db *sql.DB
var uploader *s3manager.Uploader

// casMiddleware adds CAS authentication functions to the request
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

// sentryMiddleware records panics from handlers
func sentryMiddleware() negroni.Handler {
	return negroni.HandlerFunc(func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		raven.RecoveryHandler(next)(w, r)
	})
}

// logMiddleware logs each request
func logMiddleware() negroni.Handler {
	if os.Getenv("ENVIRONMENT") == "production" {
		return negronilogrus.NewCustomMiddleware(log.InfoLevel, &log.JSONFormatter{}, "web")
	}

	return negronilogrus.NewCustomMiddleware(log.InfoLevel, &log.TextFormatter{}, "web")
}

// corsMiddleware activates the proper CORS headers
func corsMiddleware() negroni.Handler {
	log.WithField("CLIENT_ROOT", os.Getenv("CLIENT_ROOT")).Print("activating CORS header")
	return cors.New(cors.Options{
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedOrigins:   []string{os.Getenv("CLIENT_ROOT")},
		AllowCredentials: true,
	})
}

// csrfMiddleware detects potential CSRF attacks and blocks them
func csrfMiddleware() negroni.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		if !OriginValid(r) {
			dump, _ := httputil.DumpRequest(r, true)
			log.WithField("request", string(dump)).
				Error("detected request from invalid source")
			Error(w, http.StatusForbidden)
			return
		}

		next(w, r)
	}
}

// loadEnvironment manually loads config variables from .env file if they are
// not already. This is a workaround because we're not starting the app with
// Heroku local
func loadEnvironment() {
	if os.Getenv("CONFIG_PRESENT") == "true" {
		return
	}
	log.Print("environment variables not found, loading environment from .env")

	// Open .env file
	path := path.Join(os.Getenv("GOPATH"), "src/github.com/casey-chow/tigertrade/.env")
	file, err := os.Open(path)

	if err != nil {
		log.WithError(err).Fatal("unable to load .env file: file not found")
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)

	// set each enclosed config var in environment
	for scanner.Scan() {
		args := strings.Split(scanner.Text(), "=")
		os.Setenv(args[0], args[1])
	}

	if err := scanner.Err(); err != nil {
		log.WithError(err).Fatal("unable to set config vars in environment")
	}

}

// initDatabase connects to database specified in DATABASE_URL env variable
func initDatabase() {
	var err error
	db, err = sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		raven.CaptureErrorAndWait(err, nil)
		log.WithError(err).Fatal("unable to open postgres database")
	} else {
		log.Print("connected to database")
	}

	if err = db.Ping(); err != nil {
		raven.CaptureErrorAndWait(err, nil)
		log.WithError(err).Fatal("unable to connect to postgres database")
	}
}

// initS3 initializes the Amazon S3 client
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

// initLogs customizes logging
func initLogs() {
	// Output to stdout instead of the default stderr
	log.SetOutput(os.Stdout)

	// raise loglevel for tests
	if flag.Lookup("test.v") != nil {
		log.SetLevel(log.WarnLevel)
	}
}

func init() {
	loadEnvironment()
	initLogs()
	initS3()
	initDatabase()
}

// App returns a handler that encapsulates the entire application
func App() http.Handler {
	app := negroni.New()

	app.Use(casMiddleware())
	app.Use(sentryMiddleware())
	app.Use(logMiddleware())
	app.Use(csrfMiddleware())
	app.Use(corsMiddleware())
	app.Use(gzip.Gzip(gzip.DefaultCompression))
	// NOTE: all middleware that modifies the body must be called AFTER here

	app.UseHandler(Router())

	return app
}
