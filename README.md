# TigerTrade

[![Build Status](https://travis-ci.org/casey-chow/tigertrade.svg?branch=master)](https://travis-ci.org/casey-chow/tigertrade) [![codecov](https://codecov.io/gh/casey-chow/tigertrade/branch/master/graph/badge.svg?token=KOR6D8zVh3)](https://codecov.io/gh/casey-chow/tigertrade) [![Code Climate](https://codeclimate.com/github/casey-chow/tigertrade/badges/gpa.svg)](https://codeclimate.com/github/casey-chow/tigertrade)

The Princeton COS333 Project of Andrew Casey Evan Maryam Perry.

# 1. Running the server

This assumes you have initialized and migrated the database, and have Go and NPM installed.

```sh
make dev         # this installs dev dependencies
make install
make serve
```

# 2. Running the client

In another terminal, build and run with

```sh
make serve-client
```

# Development

**Server**

```
make install                    Install all dependencies
make build                      Builds the server
make serve                      Runs a hot-reloading server for development
make test                       Runs the test suite
make test-server                Runs a pretty testing server
```

**Client**
```
yarn start                      Runs an auto-reloading dev server
yarn build                      Builds the client code
yarn test                       Runs the test suite
```

**Both**
```
make dev                        Builds a development environment
make clean                      Removes all temporary files
make purge                      Uninstalls all dependencies, removes temp files
```

For dependency management, we use
[govendor](https://github.com/kardianos/govendor). Their documentation isn't
all that clear, so here's  a quick cheat sheet of relevant commands:

```
govendor fetch [github_url]     Installs a package into the vendor folder.
govendor sync                   Downloads all indicated dependencies.
govendor list                   List all installed packages
```

## Stack

- Go [Language]
    - `net/http` [Web Server]
- Postgres [Database]
- AWS S3 [Image Storage]
- Cloudflare [DNS, CDN]
- Heroku [Server]
- Sentry [Error Reporting]
- React [Frontend]
    - `create-react-app` for boilerplate
- Wordnet

## Sentry

We use Sentry to track errors. If you would like this, set the `SENTRY_DSN`
environment variable.

In Go:

```go
import "github.com/getsentry/raven-go"
_, err := DoSomeOperation()
if err != nil {
    raven.CaptureError(err, nil)
    log.Warning(err)
}
```

In Javascript:

```js
import raven from 'raven-js';

callback(function(err, res) {
    if (err) {
        raven.captureException(err);
    }
});
```


## Code Layout

```
client/             client code
server/             server code
hooks/              useful development hooks
node_modules/       Javascript dependencies
vendor/             Go dependencies
```

# Security

We aim for Security by Simplicity--that is, taking simple approaches to
development that make it as obvious as possible whether we have security
issues.

**Cross-Site Scripting**: Since React doesn't actually parse HTML, our site
is inherently XSS-resistant as long as everything we do is rendered using
React (which we believe it is).

**Cross-Site Request Forgery**: We prevent CSRF attacks using the [Origin and
referrer headers][owasp], which is the simplest valid way to do so with a
RESTful API.

[owasp]: https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet#Verifying_Same_Origin_with_Standard_Headers

**SQL Injection**: We prevent SQL injection by using prepared statements in
our SQL.

**Resource Overload**: Rather than trying to secure the system against abusive
use for images, we decided to set up our storage to log who uploads what image
and delete images after a year. We have notifications set up if the amount
stored exceeds a certain threshold, and can restrict photo uploads from there.
We also reduce photo usage by resizing and compressing all photos.
Additionally, we validate the filetypes of the uploaded images.
